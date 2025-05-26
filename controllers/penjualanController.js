const Penjualan = require ("../models/penjualanModel");
const Produk = require ("../models/produkModel");
const StokReservasi = require('../models/reservasi');
const mongoose = require('mongoose');



const penjualanController = {
    penjualanProduk: async (req, res) => {

try {        const produk_id = req.params.id;
        const nama_produk = await Produk.findById(produk_id).select("namaProduk");
        const penjualan = new Penjualan({
            user_id: req.session.user.id,
            produk_id: produk_id,
            nama_produk: nama_produk.namaProduk,
            tgl_penjualan: new Date(),
            status: 'pending'

        });
        
        await penjualan.save();

        const produk = await Produk.findById(produk_id);
        produk.stok -= 1;
        await produk.save();

        res.redirect("/produk/pelanggan")

    }catch (error) {
        console.error("Error processing penjualan: ", error);
        res.status(500).send("Internal Server Error");
   }

},
      
 getDaftarPenjualan: async (req, res) => {
        try {
            const penjualanList = await Penjualan.find()
                .populate('user_id')
                .populate('produk_id')
                .sort({ tgl_penjualan: -1 });

            const formattedPenjualan = penjualanList.map(penjualan => {
                return {
                    transaksi_id: penjualan.transaksi_id,
                    tanggal: penjualan.tgl_penjualan.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }),
                    user: penjualan.user_id?.akun?.username || '-', 
                    nama_produk: penjualan.nama_produk,
                    jumlah: penjualan.jumlah,
                    total: penjualan.total,
                    status: penjualan.status || 'Dibayar'
                };
            });

            res.render('daftarPenjualan', {
                penjualanList: formattedPenjualan,
                userRole: req.session.user?.role,
                user: req.session.user,
                currentPath: '/penjualan'
            });
        } catch (error) {
            console.error('Error fetching sales:', error);
            res.status(500).send('Terjadi kesalahan saat mengambil data penjualan');
        }
    },
getKeranjang: async (req, res) => {
    try {

           if (req.session.user.role === 'admin') {
            return res.status(403).send('Maaf, hanya pelanggan yang dapat mengakses keranjang');
        }
        const keranjangKey = `keranjang_${req.session.user.id}`;
        
        const keranjang = req.session[keranjangKey] || [];
        let totalBiaya = 0;

        keranjang.forEach(item => {
            totalBiaya += item.harga * item.jumlah;
        });

        res.render('keranjang', {
            keranjang,
            totalBiaya,
            userRole: req.session.user?.role,
            user: req.session.user,
            currentPath: '/penjualan/keranjang'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
},

hapusItemKeranjang: async (req, res) => {
    try {
        const produkId = req.params.id;
        const userId = req.session.user.id;
        const keranjangKey = `keranjang_${userId}`;
        
        if (!req.session[keranjangKey]) {
            return res.redirect('/penjualan/keranjang');
        }
        
        const item = req.session[keranjangKey].find(item => 
            item.produkId.toString() === produkId
        );

        if (item) {
            await StokReservasi.deleteMany({
                user_id: userId,
                produk_id: produkId
            });
        }

        req.session[keranjangKey] = req.session[keranjangKey].filter(item => 
            item.produkId.toString() !== produkId
        );
        
        res.redirect('/penjualan/keranjang');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
},
tambahKeKeranjang: async (req, res) => {
    try {

        if (req.session.user.role === 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Maaf, hanya pelanggan yang dapat melakukan pembelian'
            });
        }

        const produkId = req.params.id;
        const userId = req.session.user.id;
        const keranjangKey = `keranjang_${userId}`;

        const produk = await Produk.findById(produkId);
        if (!produk) {
            return res.status(404).json({
                success: false,
                message: 'Produk tidak ditemukan'
            });
        }

        const reservasi = await StokReservasi.aggregate([
            {
                $match: {
                    produk_id: new mongoose.Types.ObjectId(produkId)
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$jumlah" }
                }
            }
        ]);

        const reservedStok = reservasi[0]?.total || 0;
        const stokTersedia = produk.stok - reservedStok;

        if (stokTersedia <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Stok produk habis'
            });
        }

        if (!req.session[keranjangKey]) {
            req.session[keranjangKey] = [];
        }

        const existingItem = req.session[keranjangKey].find(item => 
            item.produkId.toString() === produkId.toString()
        );

        if (existingItem) {
            existingItem.jumlah += 1;
        } else {
            req.session[keranjangKey].push({
                produkId: produk._id,
                namaProduk: produk.namaProduk,
                harga: produk.harga,
                jumlah: 1
            });
        }

        await StokReservasi.create({
            user_id: userId,
            produk_id: produkId,
            jumlah: 1
        });

        res.json({
            success: true,
            message: 'Produk berhasil ditambahkan ke keranjang'
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menambahkan ke keranjang'
        });
    }
},

checkout: async (req, res) => {
    try {

          if (req.session.user.role === 'admin') {
            return res.status(403).send('Maaf, hanya pelanggan yang dapat melakukan checkout');
        }

        const keranjangKey = `keranjang_${req.session.user.id}`;
        const keranjang = req.session[keranjangKey] || [];
        
        if (keranjang.length === 0) {
            return res.redirect('/penjualan/keranjang');
        }

        const transaksiId = 'TRX-' + Date.now();
        let totalBiaya = 0;
        const items = [];

        for (const item of keranjang) {
            const produk = await Produk.findById(item.produkId);
            if (!produk) {
                throw new Error(`Produk ${item.namaProduk} tidak ditemukan`);
            }

            const itemTotal = item.harga * item.jumlah;

            await Produk.findByIdAndUpdate(
                item.produkId,
                { $inc: { stok: -item.jumlah } }
            );

            const penjualan = new Penjualan({
                transaksi_id: transaksiId,
                user_id: req.session.user.id,
                produk_id: item.produkId,
                nama_produk: item.namaProduk,
                jumlah: item.jumlah,
                harga: item.harga,
                total: itemTotal, 
                tgl_penjualan: new Date()
            });
            await penjualan.save();

            totalBiaya += itemTotal;
            items.push({
                nama_produk: item.namaProduk,
                jumlah: item.jumlah,
                harga: item.harga,
                total: itemTotal
            });
        }

        req.session[keranjangKey] = [];

        res.render('invoice', {
            transaksiId,
            items,
            totalBiaya,
            userRole: req.session.user?.role,
            user: req.session.user,
             currentPath: '/penjualan' 
        });

    } catch (error) {
        console.error('Error saat checkout:', error);
        res.status(500).send(`Terjadi kesalahan saat checkout: ${error.message}`);
    }
},

    clearPembelian: async (req, res) => {
        try {
            await require('../models/detailPenjualanModel').deleteMany({});
            await require('../models/penjualanModel').deleteMany({});
            res.redirect('/penjualan');
        } catch (error) {
            console.error("Error clearing pembelian:", error);
            res.status(500).send("Gagal menghapus data pembelian");
        }
    }

};

module.exports = penjualanController;