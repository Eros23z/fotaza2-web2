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
DROP TABLE IF EXISTS mensajes CASCADE;

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
    filtrada BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_usuario_pub FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE imagenes (
    id_imagen SERIAL PRIMARY KEY,
    id_publicacion INT NOT NULL,
    imagen_url TEXT NOT NULL,
    tiene_copyright BOOLEAN DEFAULT FALSE,
    marca_agua BOOLEAN DEFAULT FALSE, 
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
    filtrado BOOLEAN DEFAULT FALSE,
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
    id_publicacion INT,
    tipo_evento VARCHAR(100) NOT NULL CHECK (tipo_evento IN ('comentario', 'valoracion', 'me_interesa', 'nuevo_seguidor', 'guardada')),
    leida BOOLEAN DEFAULT FALSE,
    fecha_notificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_destino_not FOREIGN KEY (id_usuario_destino) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_origen_not FOREIGN KEY (id_usuario_origen) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_publicacion_not FOREIGN KEY (id_publicacion) REFERENCES publicaciones(id_publicacion) ON DELETE CASCADE
);

CREATE TABLE mensajes (
    id_mensaje SERIAL PRIMARY KEY,
    id_usuario_envia INT NOT NULL,
    id_usuario_recibe INT NOT NULL,
    texto_mensaje TEXT NOT NULL,
    fecha_mensaje TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_envia_msg FOREIGN KEY (id_usuario_envia) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    CONSTRAINT fk_usuario_recibe_msg FOREIGN KEY (id_usuario_recibe) REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);



INSERT INTO usuarios (nombre, apellido, username, email, password, fecha_nacimiento, rol, estado) 
VALUES 
('Admin', 'Validador', 'admin_validador', 'admin@fotaza.com', '$2b$10$EokGvk4qSyPSH.3C72swvuO58CSwJ6d2wVY0FujmwdeDEnsBg2Af.', '1990-01-01', 'validador', 'activo'),
('Eros', 'Dev', 'eros_dev', 'eros@fotaza.com', '$2b$10$EokGvk4qSyPSH.3C72swvuO58CSwJ6d2wVY0FujmwdeDEnsBg2Af.', '2000-05-15', 'usuario', 'activo'),
('Juan', 'Perez', 'juan_perez', 'juan@fotaza.com', '$2b$10$EokGvk4qSyPSH.3C72swvuO58CSwJ6d2wVY0FujmwdeDEnsBg2Af.', '1995-08-20', 'usuario', 'activo'),
('Maria', 'Gomez', 'maria_gomez', 'maria@fotaza.com', '$2b$10$EokGvk4qSyPSH.3C72swvuO58CSwJ6d2wVY0FujmwdeDEnsBg2Af.', '1998-12-10', 'usuario', 'activo'),
('Usuario', 'Bloqueado', 'user_blocked', 'blocked@fotaza.com', '$2b$10$EokGvk4qSyPSH.3C72swvuO58CSwJ6d2wVY0FujmwdeDEnsBg2Af.', '1992-04-05', 'usuario', 'inactivo');

-- Publicaciones de ejemplo
INSERT INTO publicaciones (id_usuario, titulo, descripcion, comentarios_cerrados, filtrada)
VALUES
(2, 'Atardecer en la montaña', 'Un hermoso atardecer tomado en las sierras cordobesas.', FALSE, FALSE),
(2, 'Luces de la ciudad', 'Fotografía nocturna de larga exposición del centro de la ciudad.', FALSE, FALSE),
(3, 'Bosque de Pinos', 'Caminata matutina rodeado de naturaleza y aroma a pino.', FALSE, FALSE),
(4, 'Retrato Minimalista', 'Estudio de luces y sombras en retrato blanco y negro.', FALSE, FALSE),
(3, 'Publicacion Indecente', 'Este post va a ser denunciado y dado de baja para pruebas de baneo.', FALSE, FALSE);

-- Imágenes asociadas a publicaciones
-- Nota: Usamos URLs ficticias / de ejemplo que apunten a imágenes públicas de Unsplash para pruebas visuales bonitas
INSERT INTO imagenes (id_publicacion, imagen_url, tiene_copyright, marca_agua)
VALUES
(1, 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800', FALSE, FALSE),
(2, 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800', TRUE, TRUE),
(3, 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800', FALSE, FALSE),
(4, 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', TRUE, FALSE),
(5, 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800', FALSE, FALSE);

-- Etiquetas
INSERT INTO etiquetas (nombre_tag)
VALUES
('paisajes'),
('nocturna'),
('naturaleza'),
('retrato'),
('test');

-- Relación Publicación - Etiqueta
INSERT INTO publicacion_etiqueta (id_publicacion, id_tag)
VALUES
(1, 1),
(1, 3),
(2, 2),
(3, 3),
(4, 4),
(5, 5);

-- Comentarios
INSERT INTO comentarios (id_usuario, id_publicacion, texto_comentario, filtrado)
VALUES
(3, 1, '¡Qué foto tan increíble! Me encanta la iluminación.', FALSE),
(4, 1, 'Impresionante atardecer, felicitaciones.', FALSE),
(2, 3, 'Hermoso bosque, ¿dónde queda?', FALSE),
(3, 4, 'Me gusta el contraste del blanco y negro.', FALSE),
(4, 3, 'Este comentario es ofensivo y será denunciado', FALSE);

-- Valoraciones (Ratings)
INSERT INTO valoraciones_imagen (id_usuario, id_imagen, puntaje)
VALUES
(3, 1, 5),
(4, 1, 5), -- Atardecer tiene promedio 5.0 (2 votos) - Altamente valorada
(3, 2, 4),
(4, 2, 5), -- Luces de la ciudad tiene promedio 4.5 (2 votos) - Altamente valorada
(2, 3, 3), -- Bosque de Pinos tiene promedio 3.0 (1 voto)
(2, 4, 4); -- Retrato tiene promedio 4.0 (1 voto)

-- Seguidores
INSERT INTO seguidores (id_seguidor, id_seguido)
VALUES
(2, 3), -- Eros sigue a Juan
(2, 4), -- Eros sigue a Maria
(3, 2), -- Juan sigue a Eros
(4, 2); -- Maria sigue a Eros

-- Mensajes privados
INSERT INTO mensajes (id_usuario_envia, id_usuario_recibe, texto_mensaje, fecha_mensaje)
VALUES
(3, 2, 'Hola Eros, me interesa comprar tu foto de atardecer.', NOW() - INTERVAL '1 hour'),
(2, 3, 'Hola Juan! Claro, charlemos sobre los detalles de la licencia.', NOW() - INTERVAL '45 minutes'),
(3, 2, 'Genial, ¿aceptás transferencia?', NOW() - INTERVAL '30 minutes');

-- Colecciones
INSERT INTO colecciones (id_usuario, nombre_coleccion)
VALUES
(2, 'Favoritos'), -- Colección privada por defecto de Eros
(2, 'Naturaleza y Paisajes'),
(3, 'Favoritos'),
(3, 'Inspiración urbana');

-- Agregar publicaciones a colecciones
INSERT INTO coleccion_publicacion (id_coleccion, id_publicacion)
VALUES
(1, 1),
(2, 1),
(2, 3),
(4, 2);

-- Denuncias
INSERT INTO denuncias (id_usuario_denunciante, id_publicacion, id_comentario, motivo, descripcion, estado)
VALUES
(3, 2, NULL, 'Copyright', 'Creo que esta foto no es del autor original, reclamo derechos.', 'Pendiente'),
(2, NULL, 5, 'Contenido inapropiado', 'El comentario de Maria es ofensivo.', 'Pendiente');

-- Notificaciones
INSERT INTO notificaciones (id_usuario_destino, id_usuario_origen, id_publicacion, tipo_evento, leida)
VALUES
(2, 3, 1, 'comentario', FALSE),
(2, 4, 1, 'comentario', TRUE),
(2, 3, 1, 'valoracion', FALSE),
(2, 3, NULL, 'nuevo_seguidor', FALSE);

-- Credenciales de administrador: admin@fotaza.com y la contraseña es: admin123
-- Credenciales de un usuario regular: eros@fotaza.com y la contraseña es: admin123
-- Credenciales de juan perez: juan@fotaza.com y la contraseña es: admin123
-- Credenciales de maria gomez: maria@fotaza.com y la contraseña es: admin123
-- Credenciales de usuario bloqueado: blocked@fotaza.com y la contraseña es: admin123