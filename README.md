# Proyecto Fotaza 2 - Programación Web II

Este es el proyecto integrador "Fotaza 2" desarrollado para la materia Programación Web II. Es una aplicación web construida con Node.js, Express y PostgreSQL que permite subir, compartir, valorar y comentar fotos, además de seguir a otros usuarios, crear colecciones y enviar mensajes privados.

## Requisitos previos

Para ejecutar la aplicación localmente, se necesita tener instalado:

- Node.js (versión 16 o superior)
- PostgreSQL

## Instrucciones para levantar el proyecto localmente

Siga los siguientes pasos para ejecutar la aplicación en su máquina:

### 1. Clonar el repositorio

Descargue el código del repositorio en su máquina local.

### 2. Instalar dependencias

Abra la terminal en la carpeta raíz del proyecto y ejecute el siguiente comando para instalar todos los módulos necesarios:

```bash
npm install
```

### 3. Configurar las variables de entorno

Cree un archivo llamado `.env` en la raíz del proyecto (puede guiarse del archivo `.env.example`). Complete las variables con sus credenciales de PostgreSQL y la clave para JWT:

```env
PORT=3000
DB_PORT=5432
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=contraseña
DB_NAME=fotaza_db
JWT_SECRET=f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8
STORAGE_TYPE=local
SUPABASE_URL=https://ddaxeynqsdkkrbepwkdh.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkYXhleW5xc2Rra3JiZXB3a2RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA2OTE5MjUsImV4cCI6MjA5NjI2NzkyNX0.iP55OlVs6PiK7UpCOLcB8WNZkHyhPvszTyqTa2Rvo24
SUPABASE_BUCKET=imagenes-fotaza
```

### 4. Inicializar la base de datos

Para crear todas las tablas necesarias e insertar los datos iniciales de prueba (usuarios, publicaciones, valoraciones y comentarios de ejemplo), ejecute el script de inicialización:

```bash
npm run db:init
```

### 5. Iniciar el servidor

Inicie la aplicación ejecutando el siguiente comando:

```bash
npm start
```

Una vez iniciado, la aplicación estará disponible en la dirección:
http://localhost:3000

## Cuentas de prueba cargadas en el sistema

Para poder probar todas las funciones y roles de la aplicación, el script de inicialización crea las siguientes cuentas de prueba. La contraseña para todas las cuentas es admin123.

- **Validador / Administrador**:
  - Correo: admin@fotaza.com
  - Usuario: admin_validador
  - Detalle: Permite acceder al panel de moderación para revisar las publicaciones y comentarios denunciados.

- **Usuario Regular 1**:
  - Correo: eros@fotaza.com
  - Usuario: eros_dev
  - Detalle: Cuenta con publicaciones creadas, seguidores y algunos mensajes de prueba.

- **Usuario Regular 2**:
  - Correo: juan@fotaza.com
  - Usuario: juan_perez
  - Detalle: Cuenta útil para realizar comentarios, valoraciones o seguir al primer usuario.

- **Usuario Regular 3**:
  - Correo: maria@fotaza.com
  - Usuario: maria_gomez
  - Detalle: Cuenta de prueba adicional.

- **Usuario Bloqueado**:
  - Correo: blocked@fotaza.com
  - Usuario: user_blocked
  - Detalle: Es un usuario inactivo que tiene 3 publicaciones dadas de baja por acumular denuncias. El sistema no le permite iniciar sesión.
