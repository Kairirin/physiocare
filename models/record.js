const mongoose = require('mongoose');

let appointmentSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    physio: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'physios',
        required: true
    },
    diagnosis: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    treatment: {
        type: String,
        required: true,
    },
    observations: {
        type: String,
        maxlength: 500
    }
});

let recordSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'patients',
        required: true
    },
    medicalRecord: {
        type: String,
        maxlength: 1000
    },
    appointments: [appointmentSchema]
});

let Record = mongoose.model('records', recordSchema);
module.exports = Record;
