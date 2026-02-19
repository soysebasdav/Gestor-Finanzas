# Documentación Completa de Arquitectura

## Índice
1. [Estructura General](#estructura-general)
2. [Base de Datos](#base-de-datos)
3. [Backend](#backend)
4. [Frontend](#frontend)
5. [Configuración](#configuración)
6. [Cómo Modificar y Mejorar](#cómo-modificar-y-mejorar)

---

## Estructura General

```
gestor-finanzas/
├── client/                    # Frontend (React)
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── pages/           # Páginas principales
│   │   ├── components/      # Componentes reutilizables
│   │   ├── lib/             # Utilidades y configuración
│   │   ├── App.tsx          # Componente raíz
│   │   ├── main.tsx         # Punto de entrada
│   │   └── index.css        # Estilos globales
│   └── index.html           # HTML principal
├── server/                    # Backend (Express + tRPC)
│   ├── _core/               # Configuración interna
│   ├── db.ts                # Funciones de base de datos
│   ├── routers.ts           # Endpoints tRPC
│   └── *.test.ts            # Tests unitarios
├── drizzle/                   # Migraciones de base de datos
│   ├── schema.ts            # Definición de tablas
│   └── migrations/          # Historial de cambios
├── shared/                    # Código compartido
├── storage/                   # Configuración de S3
├── package.json             # Dependencias del proyecto
├── tsconfig.json            # Configuración de TypeScript
├── vite.config.ts           # Configuración de Vite
├── drizzle.config.ts        # Configuración de Drizzle
└── .env                      # Variables de entorno
```

---

## Base de Datos

### Archivo: `drizzle/schema.ts`

**Propósito**: Define la estructura de todas las tablas de la base de datos.

**Tablas principales**:

#### 1. `users` - Tabla de Usuarios
```typescript
// Almacena información de usuarios autenticados
id: int - Identificador único (auto-incrementado)
openId: varchar - ID único de Manus OAuth
name: text - Nombre del usuario
email: varchar - Email del usuario
role: enum - Rol ('user' o 'admin')
createdAt: timestamp - Fecha de creación
updatedAt: timestamp - Fecha de última actualización
```

#### 2. `categories` - Tabla de Categorías
```typescript
// Agrupa conceptos en categorías (Aportes, Administración, etc.)
id: int - Identificador único
name: varchar - Nombre de la categoría
type: enum - Tipo ('ingreso' o 'egreso')
description: text - Descripción opcional
createdAt: timestamp - Fecha de creación
updatedAt: timestamp - Fecha de última actualización
```

#### 3. `concepts` - Tabla de Conceptos
```typescript
// Conceptos específicos dentro de cada categoría
id: int - Identificador único
categoryId: int - Referencia a la categoría
name: varchar - Nombre del concepto
description: text - Descripción opcional
createdAt: timestamp - Fecha de creación
updatedAt: timestamp - Fecha de última actualización
```

#### 4. `transactions` - Tabla de Transacciones
```typescript
// Registro de todos los ingresos y egresos
id: int - Identificador único
userId: int - Usuario que registró la transacción
date: timestamp - Fecha de la transacción
month: int - Mes (1-12) para filtrado rápido
year: int - Año para filtrado rápido
type: enum - Tipo ('ingreso' o 'egreso')
categoryId: int - Categoría de la transacción
conceptId: int - Concepto específico
amount: int - Monto en centavos (ej: 50000 = $500.00)
content: varchar - Descripción breve
comment: text - Comentarios adicionales
createdAt: timestamp - Fecha de creación
updatedAt: timestamp - Fecha de última actualización
```

### Cómo Modificar la Base de Datos

**Para agregar un nuevo campo a una tabla**:

1. Abre `drizzle/schema.ts`
2. Localiza la tabla que quieres modificar
3. Agrega el nuevo campo:
```typescript
// Ejemplo: agregar campo de referencia
referencia: varchar("referencia", { length: 100 }),
```

4. Ejecuta la migración:
```bash
pnpm db:push
```

**Para crear una nueva tabla**:

1. Agrega la definición en `drizzle/schema.ts`:
```typescript
export const nuevaTabla = mysqlTable("nueva_tabla", {
  id: int("id").autoincrement().primaryKey(),
  nombre: varchar("nombre", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NuevaTabla = typeof nuevaTabla.$inferSelect;
export type InsertNuevaTabla = typeof nuevaTabla.$inferInsert;
```

2. Ejecuta:
```bash
pnpm db:push
```

---

## Backend

### Archivo: `server/db.ts`

**Propósito**: Contiene todas las funciones para interactuar con la base de datos.

**Funciones principales**:

#### Gestión de Usuarios
```typescript
upsertUser(user) - Crea o actualiza un usuario
getUserByOpenId(openId) - Obtiene usuario por ID de OAuth
```

#### Gestión de Categorías
```typescript
getCategories(type?) - Obtiene todas las categorías (opcional: filtrar por tipo)
getCategoryById(id) - Obtiene una categoría específica
```

#### Gestión de Conceptos
```typescript
getConceptsByCategory(categoryId) - Obtiene conceptos de una categoría
getConceptById(id) - Obtiene un concepto específico
getAllConcepts() - Obtiene todos los conceptos
```

#### Gestión de Transacciones
```typescript
createTransaction(data) - Crea una nueva transacción
getTransactionsByUser(userId, filters) - Obtiene transacciones con filtros
getTransactionById(id, userId) - Obtiene una transacción específica
updateTransaction(id, userId, data) - Actualiza una transacción
deleteTransaction(id, userId) - Elimina una transacción
```

### Cómo Agregar una Nueva Función de Base de Datos

1. Abre `server/db.ts`
2. Agrega tu función al final del archivo:

```typescript
export async function obtenerTransaccionesPorConcepto(userId: number, conceptId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      eq(transactions.conceptId, conceptId)
    ))
    .orderBy(desc(transactions.date));
}
```

3. Usa esta función en `server/routers.ts` para exponerla como endpoint.

---

### Archivo: `server/routers.ts`

**Propósito**: Define todos los endpoints de la API (procedimientos tRPC).

**Estructura**:

```typescript
// Cada router agrupa funcionalidades relacionadas
router({
  transactions: router({
    list: protectedProcedure.query(...),    // GET
    create: protectedProcedure.mutation(...), // POST
    update: protectedProcedure.mutation(...), // PUT
    delete: protectedProcedure.mutation(...), // DELETE
  }),
  categories: router({
    list: protectedProcedure.query(...),
  }),
  // ... más routers
})
```

### Cómo Agregar un Nuevo Endpoint

1. Abre `server/routers.ts`
2. Agrega tu procedimiento dentro del router correspondiente:

```typescript
// Ejemplo: agregar endpoint para obtener resumen mensual
resumenMensual: protectedProcedure
  .input((val: any) => val)
  .query(async ({ ctx, input }) => {
    const { getTotalsByMonth } = await import("./db");
    return getTotalsByMonth(ctx.user.id, input.filters);
  }),
```

3. Luego en el frontend, úsalo así:
```typescript
const { data } = trpc.transactions.resumenMensual.useQuery({
  filters: { year: 2026 }
});
```

---

## Frontend

### Archivo: `client/src/App.tsx`

**Propósito**: Componente raíz que define las rutas principales.

**Rutas disponibles**:
- `/` - Página de inicio
- `/dashboard` - Dashboard principal
- `/transactions` - Registro de transacciones
- `/reports` - Reportes e informes
- `/404` - Página no encontrada

**Cómo agregar una nueva ruta**:

```typescript
import MiPagina from "./pages/MiPagina";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/mi-pagina"} component={MiPagina} />
      {/* ... otras rutas */}
    </Switch>
  );
}
```

---

### Archivo: `client/src/pages/Dashboard.tsx`

**Propósito**: Página principal con visualización de datos, gráficos y resumen.

**Componentes principales**:
- Filtro de fechas (desde/hasta)
- Tarjetas de resumen (Ingresos, Egresos, Neto)
- Gráficos (Barras y Pastel)
- Tabla de transacciones recientes

**Cómo modificar**:

1. **Cambiar rango de fechas por defecto**:
```typescript
const [startDate, setStartDate] = useState<string>(() => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3); // Cambiar a 3 meses atrás
  return date.toISOString().split("T")[0];
});
```

2. **Agregar un nuevo gráfico**:
```typescript
import { LineChart, Line } from "recharts";

// Dentro del return, agregar:
<Card>
  <CardHeader>
    <CardTitle>Tendencia Mensual</CardTitle>
  </CardHeader>
  <CardContent>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={transactions}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#10b981" />
      </LineChart>
    </ResponsiveContainer>
  </CardContent>
</Card>
```

3. **Cambiar cantidad de transacciones mostradas**:
```typescript
{transactions.slice(0, 20).map((t) => (  // Cambiar de 10 a 20
```

---

### Archivo: `client/src/pages/Transactions.tsx`

**Propósito**: Página para registrar nuevas transacciones.

**Campos del formulario**:
- Fecha
- Tipo (Ingreso/Egreso)
- Categoría
- Concepto
- Valor
- Contenido
- Comentario

**Cómo agregar un nuevo campo**:

1. Agrega el estado:
```typescript
const [formData, setFormData] = useState({
  // ... campos existentes
  referencia: "",  // Nuevo campo
});
```

2. Agrega el input en el formulario:
```typescript
<div>
  <Label htmlFor="referencia">Referencia</Label>
  <Input
    id="referencia"
    type="text"
    placeholder="Número de referencia"
    value={formData.referencia}
    onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
  />
</div>
```

3. Incluye el campo al crear la transacción:
```typescript
createMutation.mutate({
  // ... otros campos
  referencia: formData.referencia,
});
```

---

### Archivo: `client/src/pages/Reports.tsx`

**Propósito**: Página de reportes con filtros y exportación a Excel.

**Funcionalidades**:
- Filtro de fechas (desde/hasta)
- Resumen por categoría
- Resumen por concepto
- Exportación a Excel con múltiples hojas

**Cómo agregar un nuevo tipo de reporte**:

1. Crea una función para calcular los datos:
```typescript
const totalsByUser = transactions?.reduce((acc: any, t) => {
  // Lógica de agrupación
  return acc;
}, {});
```

2. Agrega una nueva tabla:
```typescript
<Card>
  <CardHeader>
    <CardTitle>Resumen por Usuario</CardTitle>
  </CardHeader>
  <CardContent>
    <table className="w-full text-sm">
      {/* Renderizar totalsByUser */}
    </table>
  </CardContent>
</Card>
```

3. Agrega la hoja en la exportación a Excel:
```typescript
const ws4 = XLSX.utils.json_to_sheet(userSummary);
XLSX.utils.book_append_sheet(wb, ws4, "Resumen Usuarios");
```

---

### Archivo: `client/src/index.css`

**Propósito**: Estilos globales y configuración de Tailwind CSS.

**Variables de color principales** (en tonos verdes):
```css
--primary: var(--color-emerald-700);
--accent: oklch(0.5 0.15 142);
```

**Cómo cambiar los colores**:

1. Busca la sección `:root`
2. Modifica las variables de color:
```css
:root {
  --primary: var(--color-blue-700);      /* Cambiar a azul */
  --accent: oklch(0.5 0.15 200);         /* Cambiar tono de acento */
}
```

---

## Configuración

### Archivo: `.env`

**Propósito**: Variables de entorno que NO deben subirse a GitHub.

**Variables necesarias**:
```
DATABASE_URL=mysql://usuario:contraseña@host:puerto/base_datos
JWT_SECRET=tu-clave-secreta-aqui
VITE_APP_ID=tu-app-id-manus
VITE_APP_TITLE=Gestor de Ingresos y Finanzas
```

**Cómo obtener cada variable**:

- `DATABASE_URL`: De tu proveedor de base de datos (Supabase, etc.)
- `JWT_SECRET`: Genera una cadena aleatoria segura
- `VITE_APP_ID`: De tu configuración en Manus
- `VITE_APP_TITLE`: El nombre de tu aplicación

### Archivo: `package.json`

**Propósito**: Define las dependencias y scripts del proyecto.

**Scripts principales**:
```bash
pnpm dev      # Inicia el servidor de desarrollo
pnpm build    # Compila para producción
pnpm start    # Inicia el servidor en producción
pnpm test     # Ejecuta los tests
pnpm db:push  # Aplica cambios a la base de datos
```

**Cómo agregar una nueva dependencia**:
```bash
pnpm add nombre-del-paquete
```

---

## Cómo Modificar y Mejorar

### Mejora 1: Agregar Validación de Datos

**Ubicación**: `server/routers.ts`

```typescript
import { z } from "zod";

// Definir esquema de validación
const createTransactionSchema = z.object({
  amount: z.number().positive("El monto debe ser positivo"),
  content: z.string().min(3, "Mínimo 3 caracteres"),
  conceptId: z.number().positive(),
});

// Usar en el procedimiento
create: protectedProcedure
  .input(createTransactionSchema)
  .mutation(async ({ ctx, input }) => {
    // El input está validado automáticamente
    return createTransaction({
      ...input,
      userId: ctx.user.id,
    });
  }),
```

---

### Mejora 2: Agregar Autenticación de Roles

**Ubicación**: `server/routers.ts`

```typescript
// Crear procedimiento solo para admins
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new Error("Solo administradores pueden acceder");
  }
  return next({ ctx });
});

// Usar en endpoints
deleteAllTransactions: adminProcedure.mutation(async () => {
  // Solo admins pueden ejecutar esto
});
```

---

### Mejora 3: Agregar Búsqueda de Transacciones

**Ubicación**: `server/db.ts`

```typescript
export async function searchTransactions(userId: number, query: string) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(transactions)
    .where(and(
      eq(transactions.userId, userId),
      or(
        like(transactions.content, `%${query}%`),
        like(transactions.comment, `%${query}%`)
      )
    ));
}
```

Luego exponerlo en `routers.ts`:
```typescript
search: protectedProcedure
  .input((val: any) => val)
  .query(async ({ ctx, input }) => {
    const { searchTransactions } = await import("./db");
    return searchTransactions(ctx.user.id, input.query);
  }),
```

---

### Mejora 4: Agregar Notificaciones

**Ubicación**: `client/src/pages/Transactions.tsx`

```typescript
import { toast } from "sonner";

// Mostrar notificación de éxito
toast.success("Transacción creada exitosamente");

// Mostrar notificación de error
toast.error("Error al crear la transacción");

// Mostrar notificación informativa
toast.info("Procesando datos...");
```

---

### Mejora 5: Agregar Paginación

**Ubicación**: `server/db.ts`

```typescript
export async function getTransactionsPaginated(
  userId: number,
  page: number = 1,
  pageSize: number = 10
) {
  const db = await getDb();
  if (!db) return { data: [], total: 0 };
  
  const offset = (page - 1) * pageSize;
  
  const data = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .limit(pageSize)
    .offset(offset);
  
  const total = await db
    .select({ count: count() })
    .from(transactions)
    .where(eq(transactions.userId, userId));
  
  return { data, total: total[0]?.count || 0 };
}
```

---

## Resumen de Archivos Clave

| Archivo | Propósito | Cuándo Modificar |
|---------|-----------|-----------------|
| `drizzle/schema.ts` | Estructura de BD | Agregar campos o tablas |
| `server/db.ts` | Funciones de BD | Agregar nuevas consultas |
| `server/routers.ts` | Endpoints API | Crear nuevos endpoints |
| `client/src/App.tsx` | Rutas principales | Agregar nuevas páginas |
| `client/src/pages/*.tsx` | Páginas | Modificar UI o lógica |
| `client/src/index.css` | Estilos globales | Cambiar colores o temas |
| `.env` | Configuración | Agregar nuevas variables |
| `package.json` | Dependencias | Instalar librerías |

---

## Próximos Pasos

1. **Integrar con Supabase** - Ver `GUIA_SUPABASE.md`
2. **Desplegar en GitHub** - Ver `GUIA_GITHUB_DESPLIEGUE.md`
3. **Hacer cambios** - Usa esta documentación como referencia
4. **Agregar tests** - Crea tests en `server/*.test.ts`

¡Ahora tienes el conocimiento para modificar y mejorar la aplicación!
