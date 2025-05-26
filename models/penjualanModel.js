const mongoose = require ('mongoose');

// const penjualanSchema = new mongoose.Schema({
    // tanggalPenjualan: {
    //     type: Date,
    //     required: true,
    // },
    // totalBiaya: {
    //     type: Number,
    //     required: true,
    // },
    // pelanggan_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "pelanggan",
    //     required: true,
    // },

    //  user_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    // produk_id: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'Produk',
    //     required: true
    // },
    // jumlah: {
    //     type: Number,
    //     required: true,
    //     default: 1
    // },
    // total: {
    //     type: Number,
    //     required: true
    // },
    // tgl_penjualan: {
    //     type: Date,
    //     default: Date.now
    // },
    // status: {
    //     type: String,
    //     enum: ['pending', 'success', 'cancelled'],
    //     default: 'pending'
    // }


const penjualanSchema = new mongoose.Schema({
    transaksi_id: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
        
    },
    produk_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    nama_produk: {
        type: String,
        required: true
    },
    jumlah: {
        type: Number,
        required: true
    },
    harga: {
        type: Number,
        required: true
    },
    total: {          // Tambahkan field total
        type: Number,
        required: true
    },
    tgl_penjualan: {
        type: Date,
        required: true,
        default: Date.now
    },

    
});

module.exports = mongoose.model('Penjualan', penjualanSchema);

