import "dotenv/config";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "drizzle-kit";

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

function normalizePem(pem: string) {
  // Por si lo guardan como una sola línea con "\n"
  return pem.includes("\\n") ? pem.replace(/\\n/g, "\n") : pem;
}

function resolveCaPem(): string | undefined {
  const fromEnv = process.env.DB_SSL_CA_PEM;
  if (fromEnv && fromEnv.trim()) return normalizePem(fromEnv);

  const caPathEnv = process.env.DB_SSL_CA_PATH || "tidb-ca.pem";
  const caPath = path.resolve(process.cwd(), caPathEnv);

  if (fs.existsSync(caPath)) {
    return fs.readFileSync(caPath, "utf8");
  }
  return undefined;
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const creds = parseDbUrl(DATABASE_URL);

const sslEnabled = process.env.DB_SSL === "true";

const caPem = sslEnabled ? resolveCaPem() : undefined;
if (sslEnabled && !caPem) {
  throw new Error("DB_SSL=true pero no hay CA. Define DB_SSL_CA_PEM o DB_SSL_CA_PATH.");
}

export default defineConfig({
  dialect: "mysql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    ...creds,
    ...(sslEnabled
      ? {
          ssl: {
            rejectUnauthorized: true,
            ca: caPem!,
          },
        }
      : {}),
  },
});