const penjualanController = require('../controllers/penjualanController');
const express = require('express');
const router = express.Router();
const checkSession = require('../middleware/checkSession');
const checkRole = require('../middleware/checkRole');

router.get('/', checkSession, checkRole(['admin']), penjualanController.getDaftarPenjualan);

router.get('/keranjang', checkSession, checkRole(['admin', 'pelanggan']), penjualanController.getKeranjang);

router.post('/tambah-ke-keranjang/:id', checkSession, checkRole(['admin', 'pelanggan']), penjualanController.tambahKeKeranjang);

router.get('/hapus-item/:id', checkSession, checkRole(['admin', 'pelanggan']), penjualanController.hapusItemKeranjang);

router.post('/checkout', checkSession, checkRole(['admin', 'pelanggan']), penjualanController.checkout);

router.post('/clear', checkSession, checkRole(['admin', 'pelanggan']), penjualanController.clearPembelian);

module.exports = router;