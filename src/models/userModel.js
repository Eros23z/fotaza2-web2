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
    }
};

module.exports = User;