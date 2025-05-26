const Transaksi = require('../models/transaksiModel');

const transaksiController = {
    getDaftarTransaksi: async (req, res) => {
        try {
            const transaksiList = await Transaksi.find()
                .populate('pelanggan', 'namaPelanggan')
                .populate('produk', 'namaProduk');
                
            res.render('daftarPenjualan', { 
                transaksiList,
                userRole: req.session.user?.role
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    },
    
    // ...existing code...
};

module.exports = transaksiController;