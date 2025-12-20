// server.js - Backend para EMPUVILLA S.A. E.S.P.
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Permite conexiones desde el Frontend
app.use(express.json()); // Permite recibir JSON

// Conexión a MongoDB (CORREGIDO: Sin opciones obsoletas)
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error de conexión a MongoDB:', err));

// Importar Modelo
const Pqr = require('./models/PqrModel');

// --- RUTAS API ---

// 1. Obtener todas las PQR
app.get('/api/pqrs', async (req, res) => {
    try {
        const pqrs = await Pqr.find().sort({ date: -1 }); // Las más recientes primero
        res.json(pqrs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Crear nueva PQR
app.post('/api/pqrs', async (req, res) => {
    try {
        const newPqr = new Pqr(req.body);
        const savedPqr = await newPqr.save();
        res.status(201).json(savedPqr);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// 3. Actualizar PQR (Gestión operativa)
app.put('/api/pqrs/:id', async (req, res) => {
    try {
        const updatedPqr = await Pqr.findOneAndUpdate(
            { id: req.params.id }, 
            req.body, 
            { new: true }
        );
        res.json(updatedPqr);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
});
