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
DB_HOST=localhost
DB_PORT=5432
DB_USER=su_usuario_de_postgres
DB_PASSWORD=su_contraseña_de_postgres
DB_NAME=nombre_de_su_base_de_datos
JWT_SECRET=un_secreto_para_firmar_jwt
STORAGE_TYPE=local
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
