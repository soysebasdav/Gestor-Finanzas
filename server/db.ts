import fs from "node:fs";
import path from "node:path";

import { and, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import * as mysql from "mysql2";

import {
  InsertUser,
  InsertTransaction,
  categories,
  concepts,
  transactions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

function parseDbUrl(databaseUrl: string) {
  const u = new URL(databaseUrl);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.replace(/^\//, ""),
  };
}

function loadCaPem(): string | undefined {
  // ✅ Render-friendly: CA por variable de entorno multilínea
  const fromEnv = process.env.DB_SSL_CA_PEM;
  if (fromEnv && fromEnv.trim().length > 0) return fromEnv;

  // ✅ Local/dev: CA desde archivo
  const caPathEnv = process.env.DB_SSL_CA_PATH || "tidb-ca.pem";
  const caPath = path.resolve(process.cwd(), caPathEnv);

  if (fs.existsSync(caPath)) {
    return fs.readFileSync(caPath, "utf8");
  }

  return undefined;
}

function getPool() {
  if (_pool) return _pool;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return null;

  const { host, port, user, password, database } = parseDbUrl(databaseUrl);

  const sslEnabled = process.env.DB_SSL === "true";

  let sslConfig: mysql.ConnectionOptions["ssl"] | undefined;
  if (sslEnabled) {
    const caPem = loadCaPem();

    if (!caPem) {
      console.warn(
        "[Database] DB_SSL=true pero no se encontró CA. " +
          "Configura DB_SSL_CA_PEM (recomendado en Render) o DB_SSL_CA_PATH (archivo local)."
      );
    }

    sslConfig = {
      rejectUnauthorized: true,
      ...(caPem ? { ca: caPem } : {}),
    };
  }

  _pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 5,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    ...(sslEnabled ? { ssl: sslConfig } : {}),
  });

  return _pool;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (_db) return _db;

  try {
    const pool = getPool();
    if (!pool) return null;

    _db = drizzle(pool);
    return _db;
  } catch (error) {
    console.warn("[Database] Failed to connect:", error);
    _db = null;
    _pool = null;
    return null;
  }
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };

  textFields.forEach(assignNullable);

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Categorías
export async function getCategories(type?: "ingreso" | "egreso") {
  const db = await getDb();
  if (!db) return [];

  if (type) return db.select().from(categories).where(eq(categories.type, type));
  return db.select().from(categories);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result[0];
}

// Conceptos
export async function getConceptsByCategory(categoryId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(concepts).where(eq(concepts.categoryId, categoryId));
}

export async function getConceptById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(concepts).where(eq(concepts.id, id)).limit(1);
  return result[0];
}

export async function getAllConcepts() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(concepts);
}

// Transacciones
export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(transactions).values(data);
}

export async function getTransactionsByUser(
  userId: number,
  filters?: {
    type?: "ingreso" | "egreso";
    startDate?: Date;
    endDate?: Date;
    month?: number;
    year?: number;
    categoryId?: number;
    conceptId?: number;
    conceptIds?: number[];
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions: any[] = [eq(transactions.userId, userId)];

  if (filters?.type) conditions.push(eq(transactions.type, filters.type));
  if (filters?.categoryId) conditions.push(eq(transactions.categoryId, filters.categoryId));
  if (filters?.conceptId) conditions.push(eq(transactions.conceptId, filters.conceptId));
  if (filters?.conceptIds?.length)
    conditions.push(inArray(transactions.conceptId, filters.conceptIds));
  if (filters?.month) conditions.push(eq(transactions.month, filters.month));
  if (filters?.year) conditions.push(eq(transactions.year, filters.year));

  if (filters?.startDate && filters?.endDate) {
    conditions.push(gte(transactions.date, filters.startDate));
    conditions.push(lte(transactions.date, filters.endDate));
  }

  return db.select().from(transactions).where(and(...conditions)).orderBy(desc(transactions.date));
}

export async function getTransactionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .limit(1);

  return result[0];
}

export async function updateTransaction(id: number, userId: number, data: Partial<InsertTransaction>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .update(transactions)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}

export async function deleteTransaction(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db
    .delete(transactions)
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)));
}