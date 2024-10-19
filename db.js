import pkg from 'pg';  // Importar el paquete 'pg' como CommonJS
const { Pool } = pkg;  // Extraer 'Pool' del paquete

// Configuración para conectarse a PostgreSQL
const pool = new Pool({
    user: 'postgres',   // Reemplaza con tu usuario de PostgreSQL
    host: 'localhost',    // O el host donde esté PostgreSQL
    database: 'medical_records', // El nombre de la base de datos que creaste
    password: 'h0lAmund0',   // Reemplaza con tu contraseña de PostgreSQL
    port: 5432,           // El puerto por defecto para PostgreSQL
});

// Exportar la conexión como default
export default pool;
