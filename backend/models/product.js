const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);
const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            maxLength: 300,
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        description: {
            type: String,
            trim: true,
            required: true,
            maxLength: 3000,
        },
        price: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        promotionalPrice: {
            type: mongoose.Decimal128,
            required: true,
            min: 0,
        },
        quantity: {
            type: Number,
            required: true,
            min: 0,
        },
        sold: {
            type: Number,
            required: true,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
            
        },
        listImages: {
            type: [String],
            validate: [listImagesLimit, 'The limit is 6 images'],
            default: [],
        },
        categoryId: {
            type: ObjectId,
            ref: 'Category',
            required: true,
        },
        rating: {
            type: Number,
            default: 3,
            min: 0,
            max: 5,
        },
        producerId: {
            type: ObjectId,
            ref: 'Producer',
            required: true,
        },
    },
    { timestamps: true },
);

//validators
function listImagesLimit(val) {
    return val.length > 0 && val.length <= 6;
}

module.exports = mongoose.model('Product', productSchema);
