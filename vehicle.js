const mongoose = require('mongoose');

const VehicleSchema = new mongoose.Schema({
    name: String,
    pricePerHour: Number,
    image: String,
    availability: { type: Boolean, default: true }
});

module.exports = mongoose.model('Vehicle', VehicleSchema);
