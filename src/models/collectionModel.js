const db = require('../config/db');

const collection = {
    getCollectionById: async (id_collection) => {
        const query = `SELECT id_coleccion AS id_collection, id_usuario, nombre_coleccion AS nombre_collection, fecha_creacion FROM colecciones WHERE id_coleccion = $1`;
        const { rows } = await db.query(query, [id_collection]);
        return rows[0];
    },

    createCollection: async (id_usuario, nombre_collection) => {
        const query = `INSERT INTO colecciones (id_usuario, nombre_coleccion) VALUES ($1, $2)`;
        await db.query(query, [id_usuario, nombre_collection]);
    },

    deleteCollection: async (id_collection) => {
        const query = `DELETE FROM colecciones WHERE id_coleccion = $1`;
        await db.query(query, [id_collection]);
    },

    deletePublicationFromCollection: async (id_publicacion, id_collection) => {
        const query = `DELETE FROM coleccion_publicacion WHERE id_publicacion = $1 AND id_coleccion = $2`;
        await db.query(query, [id_publicacion, id_collection]);
    },

    addPostToCollection: async (id_publicacion, id_collection) => {
        const query = `INSERT INTO coleccion_publicacion (id_publicacion, id_coleccion) VALUES ($1, $2)`;
        await db.query(query, [id_publicacion, id_collection]);
    },

    isPostInCollection: async (id_publicacion, id_collection) => {
        const query = `SELECT * FROM coleccion_publicacion WHERE id_publicacion = $1 AND id_coleccion = $2`;
        const { rows } = await db.query(query, [id_publicacion, id_collection]);
        return rows.length > 0;
    },

    ensureFavoritesCollection: async (id_usuario) => {
        const queryCheck = `SELECT * FROM colecciones WHERE id_usuario = $1 AND nombre_coleccion = 'Favoritos'`;
        const checkResult = await db.query(queryCheck, [id_usuario]);
        if (checkResult.rows.length === 0) {
            const queryInsert = `INSERT INTO colecciones (id_usuario, nombre_coleccion) VALUES ($1, 'Favoritos')`;
            await db.query(queryInsert, [id_usuario]);
        }
    },

    getUserCollections: async (id_usuario) => {
        const query = `SELECT id_coleccion AS id_collection, id_usuario, nombre_coleccion AS nombre_collection, fecha_creacion FROM colecciones WHERE id_usuario = $1`;
        const { rows } = await db.query(query, [id_usuario]);
        return rows;
    },

    getPostsInCollection: async (id_collection) => {
        const query = `
        SELECT p.*, i.imagen_url 
        FROM publicaciones p
        JOIN coleccion_publicacion cp ON p.id_publicacion = cp.id_publicacion
        LEFT JOIN imagenes i ON p.id_publicacion = i.id_publicacion
        WHERE cp.id_coleccion = $1`;
        const { rows } = await db.query(query, [id_collection]);
        return rows;
    }
}

module.exports = collection;