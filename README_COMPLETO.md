# Gestor de Ingresos y Finanzas

## 📋 Descripción

Aplicación web completa para gestión de ingresos y egresos diseñada para organizaciones sindicales. Permite registrar, filtrar, analizar y exportar transacciones financieras con un sistema de categorías y conceptos predefinidos.

---

## ✨ Características Principales

### 1. **Registro de Transacciones**
- Formulario completo para ingresos y egresos
- Campos: Fecha, Tipo, Categoría, Concepto, Valor, Contenido, Comentarios
- Validación de datos en tiempo real
- Interfaz intuitiva y responsiva

### 2. **Dashboard Interactivo**
- Visualización de totales (Ingresos, Egresos, Neto)
- Gráficos en barras y pastel
- Filtros por rango de fechas (calendario)
- Tabla de transacciones recientes
- Resumen del período seleccionado

### 3. **Sistema de Reportes**
- Reportes por categoría
- Reportes por concepto
- Resumen general de ingresos/egresos
- Filtros avanzados por rango de fechas

### 4. **Exportación a Excel**
- Descarga de datos en formato .xlsx
- Múltiples hojas (Transacciones, Resúmenes, Totales)
- Datos formateados y listos para análisis

### 5. **Categorías y Conceptos Predefinidos**

#### Ingresos:
- **Aportes**: Aportes Ordinarios, Multas Asambleas
- **Ingresos Varios**: Intereses y Rendimientos, Otros Ingresos

#### Egresos:
- **Administración de Personal**: Sueldos, Auxilio de Transporte, Bonificaciones, etc.
- **Administración General**: Reuniones, Papelería, Equipos, Servicios, etc.
- **Auxilios**: Nacimiento, Solidaridad
- **Actividad Sindical**: Agitación, Representación, Capacitación, etc.
- **Comisiones Estatutarias**: Capacitación Técnica, Deporte, Cultura
- **Gastos de Protección y S.S.**: Seguros de Vida
- **Gastos Aprobados por Asamblea**: Gastos Autorizados

### 6. **Diseño Visual**
- Fondo personalizado en tonos verdes
- Paleta de colores emerald coherente
- Interfaz moderna y profesional
- Navegación lateral intuitiva
- Responsivo en todos los dispositivos

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 19** - Framework de UI
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Recharts** - Gráficos
- **XLSX** - Exportación a Excel

### Backend
- **Express 4** - Servidor web
- **tRPC 11** - API tipada
- **TypeScript** - Tipado estático

### Base de Datos
- **PostgreSQL** (recomendado con Supabase)
- **MySQL/TiDB** (alternativa)
- **Drizzle ORM** - Gestor de base de datos

### Autenticación
- **Manus OAuth** - Sistema de login

### Herramientas
- **Vite** - Bundler
- **Vitest** - Testing
- **pnpm** - Gestor de paquetes

---

## 📁 Estructura del Proyecto

```
gestor-finanzas/
├── client/                    # Frontend React
│   ├── public/               # Archivos estáticos
│   ├── src/
│   │   ├── pages/           # Páginas principales
│   │   ├── components/      # Componentes reutilizables
│   │   ├── lib/             # Utilidades
│   │   ├── App.tsx          # Componente raíz
│   │   └── index.css        # Estilos globales
│   └── index.html
├── server/                    # Backend Express + tRPC
│   ├── db.ts                # Funciones de BD
│   ├── routers.ts           # Endpoints
│   └── *.test.ts            # Tests
├── drizzle/                   # Migraciones de BD
│   └── schema.ts            # Definición de tablas
├── shared/                    # Código compartido
├── package.json             # Dependencias
├── .env                      # Variables de entorno
├── GUIA_GITHUB_DESPLIEGUE.md # Guía de GitHub
├── DOCUMENTACION_ARQUITECTURA.md # Documentación técnica
├── GUIA_SUPABASE.md         # Guía de Supabase
└── README_COMPLETO.md       # Este archivo
```

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- pnpm (o npm)
- Git

### Instalación

```bash
# 1. Clonar o descargar el repositorio
git clone https://github.com/tu-usuario/gestor-finanzas.git
cd gestor-finanzas

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Aplicar migraciones de BD
pnpm db:push

# 5. Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

---

## 📚 Documentación

### Para Desarrolladores

1. **[GUIA_GITHUB_DESPLIEGUE.md](./GUIA_GITHUB_DESPLIEGUE.md)**
   - Cómo descargar el código
   - Cómo subirlo a GitHub
   - Cómo desplegarlo en producción

2. **[DOCUMENTACION_ARQUITECTURA.md](./DOCUMENTACION_ARQUITECTURA.md)**
   - Explicación archivo por archivo
   - Cómo modificar cada componente
   - Ejemplos de mejoras

3. **[GUIA_SUPABASE.md](./GUIA_SUPABASE.md)**
   - Cómo conectar con Supabase
   - Cómo migrar la base de datos
   - Cómo desplegar en producción

---

## 🔧 Scripts Disponibles

```bash
# Desarrollo
pnpm dev              # Inicia servidor de desarrollo

# Producción
pnpm build            # Compila para producción
pnpm start            # Inicia servidor en producción

# Base de Datos
pnpm db:push          # Aplica migraciones
pnpm db:studio        # Abre interfaz gráfica de BD

# Testing
pnpm test             # Ejecuta tests unitarios
pnpm test:watch       # Tests en modo observación

# Código
pnpm format           # Formatea el código
pnpm check            # Verifica tipos de TypeScript
```

---

## 📊 Casos de Uso

### 1. Registrar un Ingreso
1. Ve a "Registrar Transacción"
2. Selecciona Tipo: "Ingreso"
3. Elige Categoría: "Aportes"
4. Elige Concepto: "Aportes Ordinarios"
5. Ingresa el monto y fecha
6. Haz clic en "Guardar"

### 2. Generar Reporte Mensual
1. Ve a "Reportes"
2. Selecciona el rango de fechas (ej: 1 de febrero a 28 de febrero)
3. Visualiza los resúmenes por categoría y concepto
4. Haz clic en "Descargar Excel"

### 3. Analizar Tendencias
1. Ve a "Dashboard"
2. Ajusta el rango de fechas
3. Observa los gráficos de ingresos vs egresos
4. Consulta la tabla de transacciones recientes

---

## 🔐 Seguridad

- ✅ Autenticación con OAuth (Manus)
- ✅ Validación de datos en servidor
- ✅ Tipado estático con TypeScript
- ✅ Variables de entorno protegidas
- ✅ Tests unitarios incluidos

---

## 📈 Mejoras Futuras Recomendadas

1. **Edición de Transacciones**
   - Permitir editar transacciones existentes
   - Historial de cambios

2. **Filtros Avanzados en Dashboard**
   - Filtrar por concepto específico
   - Filtrar por múltiples conceptos
   - Búsqueda de texto

3. **Gráficos de Tendencia**
   - Línea de evolución mensual
   - Comparativa año a año
   - Proyecciones

4. **Usuarios Múltiples**
   - Permisos por rol
   - Auditoría de cambios
   - Reportes por usuario

5. **Integraciones**
   - Sincronización con contabilidad
   - Alertas automáticas
   - Notificaciones por email

---

## 🐛 Reporte de Problemas

Si encuentras un bug:

1. Abre un issue en GitHub
2. Describe el problema claramente
3. Incluye pasos para reproducirlo
4. Adjunta capturas de pantalla si es posible

---

## 📞 Soporte

Para preguntas o soporte:

1. Consulta la documentación en este repositorio
2. Revisa los issues cerrados (puede estar la solución)
3. Abre un nuevo issue con tu pregunta

---

## 📄 Licencia

Este proyecto está bajo licencia MIT. Puedes usarlo libremente.

---

## 👨‍💻 Autor

Desarrollado con ❤️ para gestión financiera sindical.

---

## 🎯 Próximos Pasos

1. **Descargar el código**
   - Sigue la [GUIA_GITHUB_DESPLIEGUE.md](./GUIA_GITHUB_DESPLIEGUE.md)

2. **Entender la arquitectura**
   - Lee la [DOCUMENTACION_ARQUITECTURA.md](./DOCUMENTACION_ARQUITECTURA.md)

3. **Conectar con Supabase**
   - Sigue la [GUIA_SUPABASE.md](./GUIA_SUPABASE.md)

4. **Personalizar según tus necesidades**
   - Modifica colores, campos, categorías, etc.

5. **Desplegar en producción**
   - Usa Vercel, Netlify o Railway

---

## 📊 Estadísticas del Proyecto

- **Lenguaje**: TypeScript
- **Frontend**: React 19
- **Backend**: Express + tRPC
- **BD**: PostgreSQL / MySQL
- **Tests**: 6 tests unitarios
- **Componentes**: 10+
- **Páginas**: 4 (Home, Dashboard, Transactions, Reports)

---

## 🙏 Agradecimientos

Gracias por usar Gestor de Ingresos y Finanzas. Si te resulta útil, considera compartirlo con otros.

¡Feliz gestión financiera! 💚
