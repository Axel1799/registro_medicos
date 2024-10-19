import pool from './db.js';

// Función para insertar un nuevo médico en la base de datos
export const addDoctor = async (firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude) => {
    try {
        console.log('Latitud:', latitude, 'Longitud:', longitude); // Verificar que se reciben las coordenadas
        const result = await pool.query(
            `INSERT INTO doctors (first_name, last_name, birth_date, specialty, area, institution, email, phone_number, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude]  // Asegúrate de incluir latitud y longitud
        );
        return result.rows[0];  // Retornar el registro insertado
    } catch (err) {
        console.error('Error inserting doctor:', err.message);
        throw err;
    }
};

// Función para actualizar un médico en la base de datos
export const updateDoctor = async (id, firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude) => {
    try {
        const result = await pool.query(
            `UPDATE doctors SET first_name = $1, last_name = $2, birth_date = $3, specialty = $4, area = $5, institution = $6, email = $7, phone_number = $8, latitude = $9, longitude = $10
             WHERE id = $11 RETURNING *`,
            [firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude, id]  // Asegúrate de incluir latitud y longitud
        );
        return result.rows[0];  // Retornar el registro actualizado
    } catch (err) {
        console.error('Error updating doctor:', err.message);
        throw err;
    }
};

