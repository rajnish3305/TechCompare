const mongoose = require("mongoose");
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brand: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    rating: {
        type: Number,
        required: true
    },
    image: {
        type: String
    },
    specifications: {
        ram: String,
        storage: String,
        processor: String,
        battery: String,
        display: String,
        camera: String
    }
});

module.exports = mongoose.model("Product", productSchema);