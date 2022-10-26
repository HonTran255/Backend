const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User',
            required: true,
        },
        deliveryId: {
            type: ObjectId,
            ref: 'Delivery',
            required: true,
        },
        status: {
            type: String,
            default: '0',
            enum: [
                '0', //chưa xử lý
                '1', //Đã xác nhận
                '2',// Đang giao hàng
                '3',//Đã giao hàng
                '4',//Hủy đơn
            ],
        },
        address: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        amount: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        isPaidBefore: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
