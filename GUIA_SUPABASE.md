# Guía Completa: Integración con Supabase

## ¿Qué es Supabase?

Supabase es una plataforma que proporciona:
- **Base de datos PostgreSQL** - Más potente que MySQL
- **Autenticación** - Sistema de login integrado
- **API REST** - Acceso automático a tus datos
- **Almacenamiento** - Para archivos y documentos
- **Tiempo real** - Actualizaciones en vivo

Para este proyecto, usaremos principalmente la **base de datos PostgreSQL**.

---

## Parte 1: Crear Cuenta en Supabase

### Paso 1: Registrarse

1. Ve a https://supabase.com
2. Haz clic en **Sign Up**
3. Elige una opción de registro:
   - Con GitHub (recomendado)
   - Con Google
   - Con email

### Paso 2: Crear un Proyecto

1. Después de registrarte, haz clic en **New Project**
2. Completa los datos:
   - **Project name**: `gestor-finanzas`
   - **Database password**: Crea una contraseña segura (guárdala)
   - **Region**: Elige la región más cercana a ti
3. Haz clic en **Create new project**

Espera a que se cree el proyecto (puede tomar 2-3 minutos).

### Paso 3: Obtener la URL de Conexión

1. En el panel de Supabase, ve a **Settings** → **Database**
2. Busca la sección **Connection string**
3. Selecciona **URI** (no **psql**)
4. Copia la URL, se verá así:
```
postgresql://postgres:TU_CONTRASEÑA@db.PROYECTO_ID.supabase.co:5432/postgres
```

---

## Parte 2: Configurar la Aplicación

### Paso 1: Actualizar el archivo `.env`

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza la variable `DATABASE_URL`:

```env
# Antes
DATABASE_URL=mysql://usuario:contraseña@localhost/base_datos

# Después
DATABASE_URL=postgresql://postgres:TU_CONTRASEÑA@db.PROYECTO_ID.supabase.co:5432/postgres
```

**Importante**: Reemplaza:
- `TU_CONTRASEÑA` - La contraseña que creaste
- `PROYECTO_ID` - El ID de tu proyecto (visible en la URL de Supabase)

### Paso 2: Instalar Dependencia de PostgreSQL

En la terminal, ejecuta:

```bash
pnpm add pg
```

### Paso 3: Actualizar la Configuración de Drizzle

Abre `drizzle.config.ts` y asegúrate de que esté configurado para PostgreSQL:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",  // Cambiar de "mysql" a "postgresql"
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
```

### Paso 4: Actualizar el Esquema de Base de Datos

Abre `drizzle/schema.ts` y actualiza los imports:

```typescript
// Cambiar de:
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// A:
import { integer, text, timestamp, varchar, pgTable, pgEnum } from "drizzle-orm/pg-core";

// Actualizar las definiciones de tablas:
// Cambiar mysqlTable por pgTable
// Cambiar int por integer
// Cambiar mysqlEnum por pgEnum
```

**Ejemplo de cómo quedaría**:

```typescript
import { integer, text, timestamp, varchar, pgTable, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const typeEnum = pgEnum("type", ["ingreso", "egreso"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

---

## Parte 3: Migrar la Base de Datos

### Paso 1: Generar Migraciones

En la terminal, ejecuta:

```bash
pnpm db:push
```

Este comando:
1. Genera los archivos de migración
2. Aplica los cambios a Supabase
3. Crea todas las tablas automáticamente

### Paso 2: Verificar en Supabase

1. Ve a tu proyecto en Supabase
2. En el panel izquierdo, haz clic en **SQL Editor**
3. Deberías ver tus tablas creadas

---

## Parte 4: Cargar Datos Iniciales

### Paso 1: Crear Script de Seeding

Crea un archivo `server/seed-supabase.mjs`:

```javascript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../drizzle/schema.ts";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL no está configurada");
}

const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
  console.log("🌱 Iniciando seeding...");

  // Insertar categorías de ingresos
  await db.insert(schema.categories).values([
    { name: "Aportes", type: "ingreso" },
    { name: "Ingresos Varios", type: "ingreso" },
  ]);

  // Insertar categorías de egresos
  await db.insert(schema.categories).values([
    { name: "Administración de Personal", type: "egreso" },
    { name: "Administración General", type: "egreso" },
    { name: "Auxilios", type: "egreso" },
    { name: "Actividad Sindical", type: "egreso" },
    { name: "Comisiones Estatutarias", type: "egreso" },
    { name: "Gastos de Protección y S.S.", type: "egreso" },
    { name: "Gastos Aprobados por Asamblea", type: "egreso" },
  ]);

  // Insertar conceptos (ejemplo)
  await db.insert(schema.concepts).values([
    { categoryId: 1, name: "Aportes Ordinarios" },
    { categoryId: 1, name: "Multas Asambleas" },
    { categoryId: 2, name: "Intereses y Rendimientos" },
    { categoryId: 2, name: "Otros Ingresos" },
    // ... agregar más conceptos según tu estructura
  ]);

  console.log("✅ Seeding completado");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Error en seeding:", err);
  process.exit(1);
});
```

### Paso 2: Ejecutar el Script

```bash
node server/seed-supabase.mjs
```

---

## Parte 5: Configurar Variables de Entorno en Producción

### Si usas Vercel:

1. Ve a tu proyecto en Vercel
2. Haz clic en **Settings** → **Environment Variables**
3. Agrega:
   - **Name**: `DATABASE_URL`
   - **Value**: Tu URL de Supabase
4. Haz clic en **Save**

### Si usas Netlify:

1. Ve a tu sitio en Netlify
2. Haz clic en **Site settings** → **Build & deploy** → **Environment**
3. Haz clic en **Edit variables**
4. Agrega:
   - **Key**: `DATABASE_URL`
   - **Value**: Tu URL de Supabase
5. Haz clic en **Save**

### Si usas Railway:

1. Ve a tu proyecto en Railway
2. Haz clic en tu servicio
3. Ve a **Variables**
4. Agrega `DATABASE_URL` con tu URL de Supabase

---

## Parte 6: Troubleshooting

### Error: "Connection refused"

**Causa**: La URL de conexión es incorrecta o la contraseña está mal.

**Solución**:
1. Verifica que copiaste correctamente la URL de Supabase
2. Asegúrate de que la contraseña es correcta
3. Prueba la conexión con:
```bash
psql "tu-url-de-supabase"
```

### Error: "relation does not exist"

**Causa**: Las tablas no fueron creadas.

**Solución**:
1. Ejecuta nuevamente:
```bash
pnpm db:push
```

2. Verifica en Supabase que las tablas se hayan creado

### Error: "permission denied"

**Causa**: El usuario de la base de datos no tiene permisos.

**Solución**:
1. Ve a Supabase → **Settings** → **Database** → **Users**
2. Verifica que el usuario `postgres` tenga todos los permisos

---

## Parte 7: Ventajas de Supabase vs MySQL

| Característica | Supabase (PostgreSQL) | MySQL |
|---|---|---|
| Escalabilidad | Excelente | Buena |
| Características avanzadas | Muchas (JSON, arrays, etc.) | Limitadas |
| Rendimiento | Muy rápido | Rápido |
| Costo | Gratuito hasta 500MB | Varía |
| Soporte | Comunidad activa | Muy amplio |
| Hosting | Incluido | Debes buscar |

---

## Parte 8: Próximos Pasos

### 1. Hacer Backup de Datos

En Supabase:
1. Ve a **Settings** → **Backups**
2. Haz clic en **Create backup**
3. Descarga el backup regularmente

### 2. Monitorear la Base de Datos

En Supabase:
1. Ve a **Logs** para ver las consultas
2. Ve a **Realtime** para ver actualizaciones en vivo

### 3. Escalar la Base de Datos

Si necesitas más capacidad:
1. Ve a **Settings** → **Billing**
2. Elige un plan superior

---

## Resumen Rápido

```bash
# 1. Crear cuenta en Supabase y proyecto

# 2. Copiar URL de conexión

# 3. Actualizar .env
DATABASE_URL=postgresql://...

# 4. Instalar driver PostgreSQL
pnpm add pg

# 5. Actualizar drizzle.config.ts a PostgreSQL

# 6. Actualizar drizzle/schema.ts a pgTable

# 7. Aplicar migraciones
pnpm db:push

# 8. Cargar datos iniciales
node server/seed-supabase.mjs

# 9. Probar en desarrollo
pnpm dev

# 10. Desplegar en producción con variables de entorno
```

¡Felicidades! Ahora tu aplicación está conectada a Supabase y lista para producción.
