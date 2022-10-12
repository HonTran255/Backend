const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
        },
        isDeleted: {
            type: Boolean,
        },
    },
    { timestamps: true },
);

cartSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('Cart', cartSchema);
