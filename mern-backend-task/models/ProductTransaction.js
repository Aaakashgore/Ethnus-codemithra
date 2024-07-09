const mongoose = require('mongoose');

const ProductTransactionSchema = new mongoose.Schema({
    title: String,
    description: String,
    price: Number,
    dateOfSale: Date,
    sold: Boolean
});

module.exports = mongoose.model('ProductTransaction', ProductTransactionSchema);
