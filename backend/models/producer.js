const mongoose = require('mongoose');
const { ObjectId } = mongoose.Schema;
const slug = require('mongoose-slug-generator');

mongoose.plugin(slug);

const producerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            maxLength: 32,
        },
        slug: {
            type: String,
            slug: 'name',
            unique: true,
        },
        isDeleted: {
            type: Boolean,
            default: false,
        },
        producerId: {
            type: ObjectId,
            ref: 'Producer',
            default: null,
        },
    },
    { timestamps: true },
);
producerSchema.index({ name: 1}, { unique: true });
module.exports = mongoose.model('Producer', producerSchema);
