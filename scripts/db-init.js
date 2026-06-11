require('dotenv').config();

const fs = require('fs');
const path = require('path');
const {Client} = require('pg');

async function inicializarBD() {
    const dbName = process.env.DB_NAME || 'fotaza_db';
    const sslConfig = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost') ? { rejectUnauthorized: false } : false;

    const adminClient = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: 'postgres',
        ssl: sslConfig
    });

    try {
        await adminClient.connect();
        
        const res = await adminClient.query('SELECT 1 FROM pg_database WHERE datname = $1', [dbName]);
        if (res.rowCount === 0) {
            console.log(`La base de datos "${dbName}" no existe. Creándola...`);
            await adminClient.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Base de datos "${dbName}" creada con éxito.`);
        } else {
            console.log(`La base de datos "${dbName}" ya existe.`);
        }
    } catch (error) {
        console.error("Error al verificar/crear la base de datos:", error.message);
    } finally {
        await adminClient.end();
    }

    const client = new Client({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: dbName,
        ssl: sslConfig
    });

    try {
        await client.connect();
        console.log(`Conectado a la base de datos "${dbName}"`);

        const sqlPath = path.join(__dirname, '../database/init.sql');
        const script = fs.readFileSync(sqlPath, 'utf8');
        
        await client.query(script);
        console.log("Tablas e información de prueba inicializadas correctamente.");
    } catch (error) {
        console.error("No se pudieron inicializar las tablas: ", error.message);
    } finally {
        await client.end();
    }
}

inicializarBD();