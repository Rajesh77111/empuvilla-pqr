// models/PqrModel.js
const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    action: String,
    user: String,
    note: String
});

const PqrSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    date: { type: Date, default: Date.now },
    subscriberCode: { type: String, required: true },
    name: String,
    address: String,
    neighborhood: String,
    phone: String,
    cedula: String,
    service: { type: String, enum: ['Acueducto', 'Alcantarillado', 'Aseo'] },
    description: String,
    paymentStatus: { type: String, enum: ['Al día', 'En Mora'] },
    wantsAgreement: { type: Boolean, default: false },
    status: { 
        type: String, 
        enum: ['Radicada', 'En Proceso', 'Resuelta', 'Cerrada', 'Rechazada'],
        default: 'Radicada'
    },
    attendedInAbsence: { type: Boolean, default: false },
    lastResponsible: String,
    history: [HistorySchema]
});

module.exports = mongoose.model('Pqr', PqrSchema);