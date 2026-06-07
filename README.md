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

## Informe sobre problemas encontrados y soluciones

Durante el desarrollo de este trabajo práctico nos encontramos con algunos problemas que tuvimos que resolver:

### 1. Procesamiento de imágenes y aplicación de marcas de agua
- **Problema**: Cuando el usuario sube una imagen protegida por copyright, debíamos aplicarle una marca de agua con un texto personalizado. Procesar las imágenes en Express y renderizar el texto de manera dinámica era complicado sin dañar la imagen original.
- **Solución**: Utilizamos la librería sharp para procesar la imagen cargada en memoria y componerla con un SVG temporal que contiene el texto de la marca de agua ingresado por el usuario. Esto nos permitió procesar el archivo y generar la imagen final antes de guardarla localmente.

### 2. Acceso para usuarios no registrados frente a las acciones protegidas
- **Problema**: Inicialmente, los middleware bloqueaban cualquier tipo de acceso si el usuario no estaba logueado, lo que impedía que un visitante anónimo pudiera ver las publicaciones.
- **Solución**: Separamos las rutas de visualización de las de interacción. Permitimos que cualquiera acceda a la página de inicio y a la vista de detalles del post. Luego, mediante condiciones en las plantillas PUG, ocultamos los botones para valorar, comentar, denunciar o enviar mensajes si no hay una sesión activa, redirigiendo a la vista de login si intentan forzar las acciones.

### 3. Evitar publicaciones duplicadas en las colecciones de favoritos
- **Problema**: Si un usuario intentaba agregar la misma publicación a una colección más de una vez, la base de datos arrojaba un error de clave primaria duplicada, provocando una caída (error 500) en el servidor.
- **Solución**: Implementamos una validación previa en el controlador mediante el modelo de colecciones. Antes de hacer la inserción, el sistema realiza una consulta rápida para verificar si la publicación ya existe en la colección. Si es así, se le informa al usuario con un mensaje amigable en el frontend en lugar de generar un error interno del servidor.
