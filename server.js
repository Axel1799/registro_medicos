import express from 'express';
import cors from 'cors';
import pool from './db.js';  // Asegúrate de que 'pool' está importado correctamente

const app = express();

app.use(cors());
app.use(express.json());

// Ruta para obtener todos los médicos
app.get('/api/doctors', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM doctors'); // Usamos 'pool' para consultar la base de datos
        res.status(200).json(result.rows); // Devolvemos los resultados
    } catch (err) {
        console.error('Error fetching doctors:', err.message);
        res.status(500).json({ error: 'Error fetching doctors' });
    }
});
// Ruta para agregar un nuevo médico (POST)
app.post('/api/doctors', async (req, res) => {
    const { firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude } = req.body;  // Añadimos latitude y longitude
    try {
        const newDoctor = await pool.query(
            `INSERT INTO doctors (first_name, last_name, birth_date, specialty, area, institution, email, phone_number, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,  // Añadimos $9 y $10 para latitud y longitud
            [firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude]  // Añadimos los valores de latitud y longitud
        );
        res.status(201).json(newDoctor.rows[0]);
    } catch (err) {
        console.error('Error inserting doctor:', err.message);
        res.status(500).json({ error: 'Error inserting doctor' });
    }
});

// Ruta para actualizar un médico existente
app.put('/api/doctors/:id', async (req, res) => {
    const { id } = req.params;
    const { firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude } = req.body;  // Añadimos latitude y longitude

    try {
        const result = await pool.query(
            `UPDATE doctors SET first_name = $1, last_name = $2, birth_date = $3, specialty = $4, area = $5, institution = $6, email = $7, phone_number = $8, latitude = $9, longitude = $10 
             WHERE id = $11 RETURNING *`,  // Añadimos $9 y $10 para latitud y longitud
            [firstName, lastName, birthDate, specialty, area, institution, email, phoneNumber, latitude, longitude, id]  // Añadimos los valores de latitud y longitud
        );

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error updating doctor:', err.message);
        res.status(500).json({ error: 'Error updating doctor' });
    }
});

// Ruta para borrar un médico (DELETE)
app.delete('/api/doctors/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM doctors WHERE id = $1', [id]);
        res.status(204).send(); // 204 indica que la eliminación fue exitosa
    } catch (err) {
        console.error('Error deleting doctor:', err.message);
        res.status(500).json({ error: 'Error deleting doctor' });
    }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
