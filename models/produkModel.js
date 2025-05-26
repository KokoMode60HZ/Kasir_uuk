const mongoose = require("mongoose");

const produkSchema = new mongoose.Schema({
    foto: {
        type: String,
        required: true
    },
    namaProduk: {
        type: String,
        required: true
    },
    harga: {
        type: Number,
        required: true
    },
    stok: {
        type: Number,
        required: true,
        min: 0
    },

    stokTersedia: {
        type: Number,
        default: function() {
            return this.stok; 
        }
    }
   

    
});

produkSchema.pre('save', async function(next) {
    if (!this.produk_ID) {
        // Generate simple ID: PRD-[timestamp]
        this.produk_ID = 'PRD-' + Date.now();
    }
    next();
});

module.exports = mongoose.model("Produk", produkSchema);
