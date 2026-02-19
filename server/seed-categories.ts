import "dotenv/config";

import { eq } from "drizzle-orm";
import { categories, concepts } from "../drizzle/schema";
import { getDb } from "./db";

const categoriesData = [
  // Ingresos
  { name: "Aportes", type: "ingreso" as const, description: "Aportes de afiliados" },
  { name: "Ingresos Varios", type: "ingreso" as const, description: "Otros ingresos" },

  // Egresos
  { name: "Administración de Personal", type: "egreso" as const, description: "Gastos de personal" },
  { name: "Administración General", type: "egreso" as const, description: "Gastos administrativos" },
  { name: "Auxilios", type: "egreso" as const, description: "Auxilios a afiliados" },
  { name: "Actividad Sindical", type: "egreso" as const, description: "Actividades sindicales" },
  { name: "Comisiones Estatutarias", type: "egreso" as const, description: "Comisiones estatutarias" },
  { name: "Gastos de Protección y S.S.", type: "egreso" as const, description: "Gastos de protección" },
  { name: "Gastos Aprobados por Asamblea", type: "egreso" as const, description: "Gastos aprobados" },
];

const conceptsData = [
  // Ingresos - Aportes
  { categoryName: "Aportes", name: "Aportes Ordinarios" },
  { categoryName: "Aportes", name: "Multas Asambles" },

  // Ingresos - Ingresos Varios
  { categoryName: "Ingresos Varios", name: "Intereses y redimientos" },
  { categoryName: "Ingresos Varios", name: "otros ingresos (aporte E.T.B.)" },
  { categoryName: "Ingresos Varios", name: "Otros ingresos" },

  // Egresos - Administración de Personal
  { categoryName: "Administración de Personal", name: "Sueldos y horas extras" },
  { categoryName: "Administración de Personal", name: "Auxilio de transporte" },
  { categoryName: "Administración de Personal", name: "Bonificación empleados" },
  { categoryName: "Administración de Personal", name: "Cesantías" },
  { categoryName: "Administración de Personal", name: "Intereses/Cesantías" },
  { categoryName: "Administración de Personal", name: "Primas de junio y navidad" },
  { categoryName: "Administración de Personal", name: "Vacaciones" },
  { categoryName: "Administración de Personal", name: "Dotación" },
  { categoryName: "Administración de Personal", name: "Aportes salud, pensión y riesgos" },
  { categoryName: "Administración de Personal", name: "Aportes Compensar+SENA+ICBF" },

  // Egresos - Administración General
  { categoryName: "Administración General", name: "Reunión Asamblea General" },
  { categoryName: "Administración General", name: "Reuniones J.D." },
  { categoryName: "Administración General", name: "Reunión Comités y Delegados" },
  { categoryName: "Administración General", name: "Papelería y útiles de oficina" },
  { categoryName: "Administración General", name: "Mantenimiento equipos de oficina" },
  { categoryName: "Administración General", name: "Compra de equipos de oficina" },
  { categoryName: "Administración General", name: "Suscripciones y publicaciones" },
  { categoryName: "Administración General", name: "Otros servicios informáticos" },
  { categoryName: "Administración General", name: "Asesoría jurídica" },
  { categoryName: "Administración General", name: "Procesos jurídicos" },
  { categoryName: "Administración General", name: "Asesoría Salud" },
  { categoryName: "Administración General", name: "Asesoría Financiera" },
  { categoryName: "Administración General", name: "Asesoría contable" },
  { categoryName: "Administración General", name: "Asesoría comunicaciones" },
  { categoryName: "Administración General", name: "Cafetería y aseo" },
  { categoryName: "Administración General", name: "Transportes" },
  { categoryName: "Administración General", name: "Correspondencia" },
  { categoryName: "Administración General", name: "Gastos bancarios (Chequeras y 4 x 1000)" },
  { categoryName: "Administración General", name: "Depreciación" },
  { categoryName: "Administración General", name: "Otros gastos para Afiliados" },
  { categoryName: "Administración General", name: "Locativas" },
  { categoryName: "Administración General", name: "SGSST" },

  // Egresos - Auxilios
  { categoryName: "Auxilios", name: "Nacimiento" },
  { categoryName: "Auxilios", name: "Auxilios solidaridad" },

  // Egresos - Actividad Sindical
  { categoryName: "Actividad Sindical", name: "Agitación y propaganda" },
  { categoryName: "Actividad Sindical", name: "Gastos de representación" },
  { categoryName: "Actividad Sindical", name: "Capacitación sindical" },
  { categoryName: "Actividad Sindical", name: "Solidaridad sindical" },
  { categoryName: "Actividad Sindical", name: "Gastos de viaje-viáticos" },
  { categoryName: "Actividad Sindical", name: "Apoyo social" },
  { categoryName: "Actividad Sindical", name: "Actividad Asociados" },
  { categoryName: "Actividad Sindical", name: "Defensa ETB" },
  { categoryName: "Actividad Sindical", name: "Negociación convención" },

  // Egresos - Comisiones Estatutarias
  { categoryName: "Comisiones Estatutarias", name: "Capacitación Técnica" },
  { categoryName: "Comisiones Estatutarias", name: "Fomento al deporte" },
  { categoryName: "Comisiones Estatutarias", name: "Fomento a la cultura" },

  // Egresos - Gastos de Protección y S.S.
  { categoryName: "Gastos de Protección y S.S.", name: "Seguros de vida" },

  // Egresos - Gastos Aprobados por Asamblea
  { categoryName: "Gastos Aprobados por Asamblea", name: "Gastos aprobados por asamblea" },
];

async function seed() {
  console.log("Iniciando seeding de categorías y conceptos...");

  const db = await getDb();
  if (!db) {
    throw new Error("DB not available. Revisa DATABASE_URL / DB_SSL / DB_SSL_CA_PATH.");
  }

  // Insertar categorías
  for (const cat of categoriesData) {
    await db
      .insert(categories)
      .values(cat)
      .onDuplicateKeyUpdate({
        set: {
          name: cat.name,
          type: cat.type,
          description: cat.description ?? null,
        },
      });
  }
  console.log("Categorías insertadas");

  // Insertar conceptos
  for (const concept of conceptsData) {
    const category = await db
      .select()
      .from(categories)
      .where(eq(categories.name, concept.categoryName))
      .limit(1);

    if (category.length > 0) {
      await db
        .insert(concepts)
        .values({
          categoryId: category[0].id,
          name: concept.name,
        })
        .onDuplicateKeyUpdate({
          set: { name: concept.name },
        });
    } else {
      console.warn(`[Seed] Categoría no encontrada para concepto: ${concept.categoryName}`);
    }
  }

  console.log("Conceptos insertados");
  console.log("Seeding completado ✅");
}

seed().catch((error) => {
  console.error("Error durante seeding:", error);
  process.exit(1);
});