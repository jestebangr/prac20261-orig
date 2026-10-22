// AXSO 2026-1 - Web server (Bun + MariaDB)
// 🖐 Students: DO NOT modify this file.
import mysql from "mysql2/promise";
import { join, normalize } from "node:path";
import { hostname } from "node:os";

const PORT = 3000;
const PUBLIC_DIR = join(import.meta.dir, "public");

// Database connection parameters (environment variables)
const MARIADB_HOST = process.env.MARIADB_HOST;
const MARIADB_PORT = Number(process.env.MARIADB_PORT ?? 3306);
const MARIADB_USER = process.env.MARIADB_USER;
const MARIADB_PASSWORD = process.env.MARIADB_PASSWORD;
const MARIADB_DATABASE = process.env.MARIADB_DATABASE;

const pool = mysql.createPool({
  host: MARIADB_HOST,
  port: MARIADB_PORT,
  user: MARIADB_USER,
  password: MARIADB_PASSWORD,
  database: MARIADB_DATABASE,
  connectionLimit: 5,
  connectTimeout: 3000,
  decimalNumbers: true,
});

async function getProducts(): Promise<Response> {
  try {
    const [products] = await pool.query(
      "SELECT id, sku, name, description, category, price, stock, rating FROM products ORDER BY category, name"
    );
    return Response.json({
      products,
      student: MARIADB_USER,
      created: new Date().toISOString(),
      server: `Bun ${Bun.version} @ ${hostname()}`,
    });
  } catch (err) {
    console.error("Database error:", (err as Error).message);
    return Response.json(
      { error: "Error retrieving data from database" },
      { status: 500 }
    );
  }
}

async function serveStatic(pathname: string): Promise<Response> {
  const relative = pathname === "/" ? "index.html" : pathname.slice(1);
  const filePath = normalize(join(PUBLIC_DIR, relative));
  if (!filePath.startsWith(PUBLIC_DIR)) {
    return new Response("Forbidden", { status: 403 });
  }
  const file = Bun.file(filePath);
  if (!(await file.exists())) {
    return new Response("Not found", { status: 404 });
  }
  return new Response(file);
}

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  async fetch(req) {
    const { pathname } = new URL(req.url);
    console.log(`${new Date().toISOString()} ${req.method} ${pathname}`);
    if (pathname === "/api/products") return getProducts();
    return serveStatic(pathname);
  },
});

console.log(`app listening at http://localhost:${server.port}`);
