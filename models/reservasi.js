const mongoose = require('mongoose');

const stokReservasiSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    jumlah: {
        type: Number,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now,
        expires: 3600 // Dokumen akan dihapus setelah 1 jam
    }
});

module.exports = mongoose.model('StokReservasi', stokReservasiSchema);