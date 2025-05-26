const produkController = require("../controllers/produkController");
const express = require("express");
const router = express.Router();
const checkSession = require("../middleware/checkSession");
const uploadImage = require("../middleware/uploadImage");
const checkRole = require('../middleware/checkRole');


router.get("/", checkSession, checkRole(['admin']), produkController.getDaftarProduk);
router.get("/tambah", checkSession, checkRole(['admin']), produkController.getTambahProduk);
router.post("/tambah", checkSession, checkRole(['admin']), uploadImage.single("foto"), produkController.tambahProduk);
router.get("/edit/:id", checkSession, checkRole(['admin']), produkController.getEditProduk);
router.post("/edit/:id", checkSession, checkRole(['admin']), uploadImage.single("foto"), produkController.editProduk);
router.get("/hapus/:id", checkSession, checkRole(['admin']), produkController.deleteProduk);

// Pelanggan routes
router.get("/pelanggan", checkSession, checkRole(['admin','pelanggan']), produkController.getDaftarProdukPelanggan);


module.exports = router;