const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    akun: {
        username: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['admin', 'petugas', 'pelanggan'],
            required: true,
            default: 'petugas',
        }
    },
     nama: {
        type: String,
        required: true
    },
    alamat: {
        type: String,
        required: true
    },
    telepon: {
        type: String,
        required: true
    }
});


module.exports = mongoose.model("User", userSchema);