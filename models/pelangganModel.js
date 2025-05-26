const mongoose = require("mongoose");

const pelangganSchema = new mongoose.Schema({

    
    namaPelanggan: {
        type: String,
        required: true,
    },
    alamat:{
        type: String,
        required: true,
    },
    nomerTelepon: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("pelanggan", pelangganSchema);