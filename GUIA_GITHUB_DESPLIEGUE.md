# Guía Completa: Descarga y Despliegue en GitHub

## Parte 1: Preparación Inicial

### Requisitos Previos
Antes de comenzar, asegúrate de tener instalado en tu computadora:

1. **Git** - Sistema de control de versiones
   - Descarga desde: https://git-scm.com/download
   - Verifica la instalación: `git --version`

2. **Node.js** (versión 18 o superior)
   - Descarga desde: https://nodejs.org/
   - Verifica la instalación: `node --version`

3. **pnpm** - Gestor de paquetes (más rápido que npm)
   - Instala globalmente: `npm install -g pnpm`
   - Verifica: `pnpm --version`

4. **Cuenta en GitHub**
   - Crea una en: https://github.com/signup

---

## Parte 2: Crear Repositorio en GitHub

### Paso 1: Crear nuevo repositorio en GitHub

1. Inicia sesión en tu cuenta de GitHub
2. Haz clic en el icono **+** en la esquina superior derecha
3. Selecciona **New repository**
4. Completa los datos:
   - **Repository name**: `gestor-finanzas` (o el nombre que prefieras)
   - **Description**: "Aplicación web para gestión de ingresos y egresos"
   - **Visibility**: Selecciona **Public** (para que sea visible) o **Private** (solo tú)
   - **Initialize this repository with**: NO marques nada (agregaremos archivos después)
5. Haz clic en **Create repository**

### Paso 2: Copiar la URL del repositorio

Después de crear el repositorio, verás una URL similar a:
```
https://github.com/tu-usuario/gestor-finanzas.git
```

Cópiala, la necesitarás en el siguiente paso.

---

## Parte 3: Descargar el Código desde Manus

### Paso 1: Acceder al Management UI

1. Abre tu proyecto en Manus
2. En el panel derecho, haz clic en **Code**
3. Verás una opción **Download all files**
4. Haz clic para descargar un archivo ZIP con todo el código

### Paso 2: Extraer el ZIP

1. Descarga el archivo ZIP
2. Extrae el contenido en una carpeta en tu computadora
3. Abre una terminal/consola en esa carpeta

---

## Parte 4: Configurar Git y Subir a GitHub

### Paso 1: Inicializar Git en tu carpeta local

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
# Inicializar git
git init

# Agregar todos los archivos
git add .

# Crear el primer commit
git commit -m "Commit inicial: Gestor de Finanzas"
```

### Paso 2: Conectar con tu repositorio de GitHub

Reemplaza `tu-usuario` y `gestor-finanzas` con tus valores reales:

```bash
# Agregar el repositorio remoto
git remote add origin https://github.com/tu-usuario/gestor-finanzas.git

# Cambiar el nombre de la rama a 'main' (estándar en GitHub)
git branch -M main

# Subir el código a GitHub
git push -u origin main
```

### Paso 3: Verificar en GitHub

1. Abre tu navegador y ve a `https://github.com/tu-usuario/gestor-finanzas`
2. Deberías ver todos tus archivos en el repositorio

---

## Parte 5: Configuración Local para Desarrollo

### Paso 1: Instalar dependencias

En la terminal, dentro de la carpeta del proyecto:

```bash
# Instalar todas las dependencias
pnpm install
```

Esto puede tomar algunos minutos.

### Paso 2: Configurar variables de entorno

1. Crea un archivo llamado `.env` en la raíz del proyecto
2. Copia el contenido del archivo `.env.example` (si existe)
3. Completa las variables necesarias (se explicarán en la sección de Supabase)

### Paso 3: Ejecutar el servidor de desarrollo

```bash
# Iniciar el servidor de desarrollo
pnpm dev
```

Verás algo como:
```
Server running on http://localhost:3000/
```

Abre tu navegador en `http://localhost:3000` para ver la aplicación.

---

## Parte 6: Flujo de Trabajo Continuo

### Cada vez que hagas cambios:

```bash
# 1. Ver el estado de cambios
git status

# 2. Agregar los cambios
git add .

# 3. Crear un commit con descripción
git commit -m "Descripción del cambio realizado"

# 4. Subir a GitHub
git push
```

### Ejemplos de mensajes de commit buenos:

- `git commit -m "Agregar filtro por concepto en dashboard"`
- `git commit -m "Corregir bug en exportación a Excel"`
- `git commit -m "Mejorar rendimiento de consultas de base de datos"`

---

## Parte 7: Despliegue en Producción

### Opción A: Desplegar en Vercel (Recomendado para React)

1. Ve a https://vercel.com
2. Haz clic en **Sign Up** y conecta tu cuenta de GitHub
3. Haz clic en **Import Project**
4. Selecciona tu repositorio `gestor-finanzas`
5. Configura las variables de entorno (mismas del archivo `.env`)
6. Haz clic en **Deploy**

Vercel automáticamente desplegará tu aplicación cada vez que hagas push a GitHub.

### Opción B: Desplegar en Netlify

1. Ve a https://netlify.com
2. Haz clic en **Sign up**
3. Conecta tu cuenta de GitHub
4. Selecciona el repositorio
5. Configura el comando de build: `pnpm build`
6. Configura la carpeta de publicación: `dist`
7. Haz clic en **Deploy**

### Opción C: Desplegar en Railway

1. Ve a https://railway.app
2. Haz clic en **Start Project**
3. Selecciona **Deploy from GitHub**
4. Conecta tu repositorio
5. Railway detectará automáticamente que es una aplicación Node.js
6. Configura las variables de entorno
7. Haz clic en **Deploy**

---

## Parte 8: Solución de Problemas Comunes

### Error: "fatal: not a git repository"

**Solución**: Asegúrate de estar en la carpeta correcta del proyecto.

```bash
# Verifica que estés en la carpeta correcta
pwd  # En Mac/Linux
cd   # En Windows

# Luego intenta nuevamente
git status
```

### Error: "permission denied" al hacer push

**Solución**: Configura tus credenciales de GitHub:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu-email@gmail.com"
```

### Error: "node_modules not found"

**Solución**: Reinstala las dependencias:

```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Error: "port 3000 already in use"

**Solución**: Usa un puerto diferente:

```bash
pnpm dev -- --port 3001
```

---

## Resumen Rápido

```bash
# 1. Descargar ZIP desde Manus y extraer

# 2. Abrir terminal en la carpeta

# 3. Inicializar git
git init
git add .
git commit -m "Commit inicial"

# 4. Conectar con GitHub
git remote add origin https://github.com/tu-usuario/gestor-finanzas.git
git branch -M main
git push -u origin main

# 5. Instalar dependencias
pnpm install

# 6. Ejecutar en desarrollo
pnpm dev

# 7. Hacer cambios y subir
git add .
git commit -m "Descripción del cambio"
git push
```

---

## Próximos Pasos

Una vez tengas el código en GitHub, puedes:

1. **Integrar con Supabase** - Ver la guía `GUIA_SUPABASE.md`
2. **Entender la estructura** - Ver la documentación `DOCUMENTACION_ARQUITECTURA.md`
3. **Hacer cambios** - Modificar archivos según la documentación
4. **Desplegar en producción** - Usar Vercel, Netlify o Railway

¡Felicidades! Ahora tienes tu código en GitHub y listo para colaborar con otros desarrolladores.
