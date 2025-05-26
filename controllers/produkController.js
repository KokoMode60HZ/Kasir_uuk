const Produk = new require("../models/produkModel");
const path = require ('path');
const fs = require('fs');
const mongoose = require('mongoose');
const StokReservasi = require('../models/reservasi'); 
const produkController = {
getDaftarProduk: async (req, res) => {
    try {
        const produkList = await Produk.find();
        
        const produkListWithStock = await Promise.all(produkList.map(async (produk) => {
            const reservasi = await StokReservasi.aggregate([
                {
                    $match: {
                        produk_id: new mongoose.Types.ObjectId(produk._id)
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
            return {
                ...produk.toObject(),
                stokTersedia: produk.stok - reservedStok
            };
        }));

        res.render("daftarProduk", { 
            produkList: produkListWithStock,
            userRole: req.session.user?.role,
            user: req.session.user ,
            currentPath: '/produk'
        });
    } catch (error) {
        console.error("Error fetching produk list: ", error);
        res.status(500).send("Internal Server Error");
    }
},
    getTambahProduk: (req, res) => {
        try {
            res.render('formTambahProduk', {user: req.session.user, currentPath: '/produk/tambah', userRole: req.session.user?.role});
        } catch (error) {
            console.error("Error fetching products", error);
            res.status(500).send("internal Server Error");
        }
    },

tambahProduk: async (req, res) => {
    try {
        const { nama, harga, stok } = req.body;
        const fotoPath = req.file ? req.file.filename : null;
        const produk = new Produk({
            foto: fotoPath,
            namaProduk: nama,
            harga: harga,
            stok: stok,
            stokTersedia: stok
        });
        await produk.save();
        res.redirect('/produk');
    } catch (error) {
        console.error("Error adding product: ", error);
        res.status(500).send("Internal Server Error");
    }
},
getEditProduk: async (req, res) => {
    try {
        const produkId = req.params.id;
        const produk = await Produk.findById(produkId);
        
        if (!produk) {
            return res.status(404).send("Produk tidak ditemukan");
        }
        
      
        const reservasi = await StokReservasi.aggregate([
            {
                $match: {
                    produk_id: new mongoose.Types.ObjectId(produkId) }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$jumlah" }
                }
            }
        ]);

        const reservedStok = reservasi[0]?.total || 0;
        
        const produkWithAvailableStock = {
            ...produk.toObject(),
            stokTersedia: produk.stok - reservedStok
        };

        res.render('formEditProduk', { 
            produk: produkWithAvailableStock,
            userRole: req.session.user?.role,
            user: req.session.user,
            currentPath : '/produk/pelanggan' 
        });
    } catch (error) {
        console.error("Error saat mengambil data produk:", error);
        res.status(500).send("Terjadi kesalahan internal");
    }
},

editProduk: async (req, res) => {
    try {
        const produkId = req.params.id;
        const { nama, harga, stok } = req.body;
        const fotoPath = req.file ? req.file.filename : null;

   
        const produk = await Produk.findById(produkId);
        if(!produk) {
            return res.status(404).send("Produk tidak ditemukan");
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

        if (stok < reservedStok) {
            return res.status(400).send(`Stok tidak boleh kurang dari jumlah reservasi (${reservedStok})`);
        }

        if (fotoPath && produk.foto) {
            const oldFotoPath = path.join(__dirname, '../public/image', produk.foto);
            if (fs.existsSync(oldFotoPath)) {
                fs.unlinkSync(oldFotoPath);
            }
        }

        const updateData = {
            namaProduk: nama,
            harga: harga,
            stok: stok,
            stokTersedia: stok - reservedStok
        };

        if (fotoPath) {
            updateData.foto = fotoPath;
        }

        const updatedProduk = await Produk.findByIdAndUpdate(
            produkId,
            updateData,
            { 
                new: true, 
                runValidators: true 
            }
        );

        if (!updatedProduk) {
            throw new Error('Gagal mengupdate produk');
        }

        res.redirect('/produk');
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
    }
},

    deleteProduk: async (req, res) => {
        try {
            const produkId = req.params.id.trim();

            if (!mongoose.Types.ObjectId.isValid(produkId)) {
                return res.status(400).send('ID tidak valid');
            }

            const produk = await Produk.findById(produkId);
            if (!produk) {
                return res.status(404).send('Produk tidak ditemukan');
            }

            if (produk.foto) {
                const imagePath = path.join(__dirname, '../public/image', produk.foto);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }

            await Produk.findByIdAndDelete(produkId);
            res.redirect('/produk');
        } catch (error) {
            console.error('Error deleting produk:', error);
            res.status(500).send('Internal Server Error');
        }
    },

getDaftarProdukPelanggan: async (req, res) => {
    try {
        const produkList = await Produk.find();
        
        const produkListWithStock = await Promise.all(produkList.map(async (produk) => {
            const reservasi = await StokReservasi.aggregate([
                {
                    $match: {
                        produk_id: new mongoose.Types.ObjectId(produk._id)
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
            return {
                ...produk.toObject(),
                stokTersedia: produk.stok - reservedStok
            };
        }));

        res.render("daftarProdukPelanggan", { 
            produkList: produkListWithStock,
            userRole: req.session.user?.role,
            user: req.session.user ,
            currentPath: '/produk/pelanggan'
        });
    } catch (error) {
        console.error("Error fetching products", error);
        res.status(500).send("Internal Server Error");
    }
},
};

module.exports = produkController;