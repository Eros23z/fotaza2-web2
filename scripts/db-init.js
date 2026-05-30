require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {Client} = require('pg');

async function inicializarBD() {
    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    try {
        await client.connect();
        console.log("Conectado a postgres");

        const sqlPath = path.join(__dirname, '../database/init.sql');
        const script = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query(script);
        console.log("La base de datos se creó correctamente");
    } catch (error) {
        console.error("No se pudo crear la base de datos: ", error.message);
    } finally {
        await client.end();
    }
}

inicializarBD();