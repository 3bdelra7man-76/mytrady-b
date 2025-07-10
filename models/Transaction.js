const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['transfer', 'card_redeem', 'system'],
        default: 'transfer'
    }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
