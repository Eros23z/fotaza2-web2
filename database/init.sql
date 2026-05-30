DROP TABLE IF EXISTS notificaciones CASCADE;
DROP TABLE IF EXISTS denuncias CASCADE;
DROP TABLE IF EXISTS coleccion_publicacion CASCADE;
DROP TABLE IF EXISTS colecciones CASCADE;
DROP TABLE IF EXISTS valoraciones_imagen CASCADE;
DROP TABLE IF EXISTS comentarios CASCADE;
DROP TABLE IF EXISTS publicacion_etiqueta CASCADE;
DROP TABLE IF EXISTS etiquetas CASCADE;
DROP TABLE IF EXISTS imagenes CASCADE;
DROP TABLE IF EXISTS publicaciones CASCADE;
DROP TABLE IF EXISTS seguidores CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'validador')),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE seguidores (
    id_seguidor INT NOT NULL,
    id_seguido INT NOT NULL,
    fecha_seguimiento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_seguidor, id_seguido),
    CONSTRAINT fk_seguidor FOREIGN KEY (id_seguidor) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_seguido FOREIGN KEY (id_seguido) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT chk_no_auto_seguimiento CHECK (id_seguidor != id_seguido)
);

CREATE TABLE publicaciones (
    id_publicacion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    titulo VARCHAR(150) NOT NULL,
    descripcion TEXT,
    fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comentarios_cerrados BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_usuario_pub FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE imagenes (
    id_imagen SERIAL PRIMARY KEY,
    id_publicacion INT NOT NULL,
    imagen_url TEXT NOT NULL,
    tiene_copyright BOOLEAN DEFAULT FALSE,
    marca_agua VARCHAR(255), 
    CONSTRAINT fk_publicacion_img FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE
);

CREATE TABLE etiquetas (
    id_tag SERIAL PRIMARY KEY,
    nombre_tag VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE publicacion_etiqueta (
    id_publicacion INT NOT NULL,
    id_tag INT NOT NULL,
    PRIMARY KEY (id_publicacion, id_tag),
    CONSTRAINT fk_pub_etq FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
    CONSTRAINT fk_tag_etq FOREIGN KEY (id_tag) REFERENCES etiquetas(id_tag) ON DELETE CASCADE
);

CREATE TABLE comentarios (
    id_comentario SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_publicacion INT NOT NULL,
    texto_comentario TEXT NOT NULL,
    fecha_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_com FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_publicacion_com FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE
);

CREATE TABLE valoraciones_imagen (
    id_usuario INT NOT NULL,
    id_imagen INT NOT NULL,
    puntaje INT NOT NULL CHECK (puntaje >= 1 AND puntaje <= 5), 
    fecha_valoracion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_usuario, id_imagen), 
    CONSTRAINT fk_usuario_val FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_imagen_val FOREIGN KEY (id_imagen) REFERENCES imagenes(id_imagen) ON DELETE CASCADE
);

CREATE TABLE colecciones (
    id_coleccion SERIAL PRIMARY KEY,
    id_usuario INT NOT NULL,
    nombre_coleccion VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_col FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE coleccion_publicacion (
    id_coleccion INT NOT NULL,
    id_publicacion INT NOT NULL,
    PRIMARY KEY (id_coleccion, id_publicacion),
    CONSTRAINT fk_coleccion_cp FOREIGN KEY (id_coleccion) REFERENCES colecciones(id_coleccion) ON DELETE CASCADE,
    CONSTRAINT fk_publicacion_cp FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE
);

CREATE TABLE denuncias (
    id_denuncia SERIAL PRIMARY KEY,
    id_usuario_denunciante INT NOT NULL,
    id_publicacion INT, 
    id_comentario INT,  
    motivo VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    estado VARCHAR(30) DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Desestimada', 'Dada de baja')),
    fecha_denuncia TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_den FOREIGN KEY (id_usuario_denunciante) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_publicacion_den FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE,
    CONSTRAINT fk_comentario_den FOREIGN KEY (id_comentario) REFERENCES comentarios(id_comentario) ON DELETE CASCADE,
    CONSTRAINT chk_objetivo_denuncia CHECK (
        (id_publicacion IS NOT NULL AND id_comentario IS NULL) OR 
        (id_publicacion IS NULL AND id_comentario IS NOT NULL)
    )
);

CREATE TABLE notificaciones (
    id_notificacion SERIAL PRIMARY KEY,
    id_usuario_destino INT NOT NULL,
    id_usuario_origen INT NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL CHECK (tipo_evento IN ('comentario', 'valoracion', 'me_interesa', 'nuevo_seguidor')),
    leida BOOLEAN DEFAULT FALSE,
    fecha_notificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_destino_not FOREIGN KEY (id_usuario_destino) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_origen_not FOREIGN KEY (id_usuario_origen) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);



--INSERT INTO usuarios (nombre, apellido, username, email, password, fecha_nacimiento, rol) 
--VALUES 
--('Admin', 'Validador', 'admin_validador', 'admin@fotaza.com', '$2b$10$EjemploHashBCryptAca...', '1990-01-01', 'validador'),
--('Eros', 'Dev', 'eros_dev', 'eros@fotaza.com', '$2b$10$EjemploHashBCryptAca...', '2000-05-15', 'usuario');