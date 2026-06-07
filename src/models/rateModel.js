const db = require('../config/db');

const Rate = {
    addRating: async (id_usuario, id_imagen, puntaje) => {
        const query = `INSERT INTO valoraciones_imagen (id_usuario, id_imagen, puntaje) VALUES ($1, $2, $3)`;
        await db.query(query, [id_usuario, id_imagen, puntaje]);
    },

    userHasRated: async (id_usuario, id_imagen) => {
        const query = `SELECT * FROM valoraciones_imagen WHERE id_usuario = $1 AND id_imagen = $2`;
        const { rows } = await db.query(query, [id_usuario, id_imagen]);
        return rows.length > 0;
    },

    getAverageRating: async (id_imagen) => {
        const query = `SELECT AVG(puntaje) as promedio FROM valoraciones_imagen WHERE id_imagen = $1`;
        const { rows } = await db.query(query, [id_imagen]);
        return rows[0];
    },

    getUserRatedImageIdsForPost: async (id_usuario, id_publicacion) => {
        const query = `
            SELECT id_imagen 
            FROM valoraciones_imagen 
            WHERE id_usuario = $1 AND id_imagen IN (
                SELECT id_imagen FROM imagenes WHERE id_publicacion = $2
            )
        `;
        const { rows } = await db.query(query, [id_usuario, id_publicacion]);
        return rows.map(r => r.id_imagen);
    }
};

module.exports = Rate;
