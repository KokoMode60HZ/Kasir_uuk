const mongoose = require('mongoose');

const transaksiSchema = new mongoose.Schema({
    pelanggan: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    produk: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Produk',
        required: true
    },
    jumlah: {
        type: Number,
        required: true,
        min: 1
    },
    tanggalTransaksi: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'selesai', 'batal'],
        default: 'pending'
    }
});

module.exports = mongoose.model('Transaksi', transaksiSchema);