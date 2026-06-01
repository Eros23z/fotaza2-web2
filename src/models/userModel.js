const db = require('../config/db');

const User = {
    // Buscar un usuario por email o username
    findByField: async (field, value) => {
        const query = `SELECT * FROM usuarios WHERE ${field} = $1`;
        const { rows } = await db.query(query, [value]);
        return rows[0];
    },

    // Crear un nuevo usuario
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

    // la parte de los followers
    follow: async (id_seguidor, id_seguido) => {
        const query = `
            INSERT INTO seguidores (id_seguidor, id_seguido)
            VALUES ($1, $2)
        `;
        await db.query(query, [id_seguidor, id_seguido]);
    },

    unfollow: async (id_seguidor, id_seguido) => {
        const query = `
            DELETE FROM seguidores WHERE id_seguidor = $1 AND id_seguido = $2
        `;
        await db.query(query, [id_seguidor, id_seguido]);
    },

    // saber cuantos seguidores tiene alguien y a cuantos sigue
    countFollowers: async (id_usuario) => {
        const query = `
            SELECT COUNT(*) FROM seguidores WHERE id_seguido = $1
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return parseInt(rows[0].count, 10);
    },

    countFollowing: async (id_usuario) => {
        const query = `
            SELECT COUNT(*) FROM seguidores WHERE id_seguidor = $1
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return parseInt(rows[0].count, 10);
    },
    
    getProfile: async (id_usuario) => {
        const query = `
            SELECT * FROM usuarios WHERE id_usuario = $1
        `;
        const { rows } = await db.query(query, [id_usuario]);
        return rows[0];
    },

    isFollowing: async (id_seguidor, id_seguido) => {
        const query = `
            SELECT COUNT(*) FROM seguidores WHERE id_seguidor = $1 AND id_seguido = $2
        `;
        const { rows } = await db.query(query, [id_seguidor, id_seguido]);
        return parseInt(rows[0].count, 10) > 0;
    },

};  

module.exports = User;