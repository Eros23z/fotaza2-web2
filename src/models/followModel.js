const db = require('../config/db');

const Follow = {
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

    isFollowing: async (id_seguidor, id_seguido) => {
        const query = `
            SELECT COUNT(*) FROM seguidores WHERE id_seguidor = $1 AND id_seguido = $2
        `;
        const { rows } = await db.query(query, [id_seguidor, id_seguido]);
        return parseInt(rows[0].count, 10) > 0;
    }
};

module.exports = Follow;
