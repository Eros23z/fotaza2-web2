const db = require('../config/db');

const User = {
    findByField: async (field, value) => {
        const query = `SELECT * FROM usuarios WHERE ${field} = $1`;
        const { rows } = await db.query(query, [value]);
        return rows[0];
    },

    create: async (userData) => {
        const { nombre, apellido, username, email, password, fecha_nacimiento } = userData;
        const query = `
            INSERT INTO usuarios (nombre, apellido, username, email, password, fecha_nacimiento)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_usuario, username;
        `;
        const values = [nombre, apellido, username, email, password, fecha_nacimiento];
        const { rows } = await db.query(query, values);
        return rows[0];
    },

    getProfile: async (id_usuario) => {
        const query = `
            SELECT * FROM usuarios WHERE id_usuario = $1
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return rows[0];
    },

    deactivate: async (id_usuario) => {
        const query = `UPDATE usuarios SET estado = 'inactivo' WHERE id_usuario = $1`;
        await db.query(query, [id_usuario]);
    },
    
    countTakenDownPosts: async (id_usuario) => {
        const query = `
            SELECT COUNT(DISTINCT id_publicacion) 
            FROM denuncias 
            WHERE id_publicacion IN (
                SELECT id_publicacion 
                FROM publicaciones 
                WHERE id_usuario = $1
            ) AND estado = 'Dada de baja'
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return parseInt(rows[0].count, 10);
    }
};  

module.exports = User;