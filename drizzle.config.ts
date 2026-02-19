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

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL is required");

const creds = parseDbUrl(DATABASE_URL);

const sslEnabled = process.env.DB_SSL === "true";
const caPathEnv = process.env.DB_SSL_CA_PATH || "tidb-ca.pem";
const caPath = path.resolve(process.cwd(), caPathEnv);

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
            ca: fs.readFileSync(caPath, "utf8"),
          },
        }
      : {}),
  },
});