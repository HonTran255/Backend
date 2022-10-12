const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const transactionSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        isUp: {
            type: Boolean,
            required: true,
        },
        code: {
            type: String,
        },
        amount: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        account: {
            type: String,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Transaction', transactionSchema);
