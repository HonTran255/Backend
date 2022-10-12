const Producer = require('../models/producer');
const fs = require('fs');
const { errorHandler } = require('../helpers/errorHandler');
const producer = require('../models/producer');

exports.producerById = (req, res, next, id) => {
    Producer.findById(id, (error, producer) => {
        if (error || !producer) {
            return res.status(404).json({
                error: 'Không tìm thấy nhà sản xuất',
            });
        }

        req.producer = producer;
        next();
    });
};

exports.getproducer = (req, res) => {
    Producer.findOne({ _id: req.producer._id })
        .exec()
        .then((producer) => {
            if (!producer)
                return res.status(500).json({
                    error: 'Load producer failed',
                });

            return res.json({
                success: 'Load producer successfully',
                producer: producer,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Load producer failed',
            });
        });
};

exports.checkproducer = (req, res, next) => {
    const { producerId } = req.fields;
    if (producerId) {
        Producer.findOne({ _id: producerId })
            .populate('producerId')
            .exec()
            .then((producer) => {
                if (
                    !producer ||
                    (producer.producerId != null &&
                        producer.producerId.producerId != null)
                ) {
                    return res.status(400).json({
                        error: 'producerId invalid',
                    });
                } else next();
            })
            .catch((error) => {
                return res.status(400).json({
                    error: 'producerId invalid',
                });
            });
    } else next();
};

exports.createproducer = (req, res) => {
    const { name, producerId } = req.body;
    const producer = new Producer({ name, producerId });
    producer.save((error, producer) => {
        if (error || !producer) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Tạo nhà sản xuất thành công',
        });
    });
};

exports.updateproducer = (req, res) => {
    let { name, producerId } = req.body;
    if (!producerId) producerId = null;
    else if (producerId == req.producer._id) {
        return res.status(400).json({
            error: 'producerId invalid',
        });
    }

    if (!name) {
        return res.status(400).json({
            error: 'All fields are required',
        });
    }

    Producer.findOneAndUpdate(
        { _id: req.producer._id },
        { $set: { name, producerId } },
        { new: true },
    )
    .populate({
        path: 'producerId',
        populate: { path: 'producerId' },
    })
        .exec()
        .then((producer) => {
            if (!producer) {
                return res.status(400).json({
                    error: errorHandler(error),
                });
            }

            return res.json({
                success: 'Update producer successfully',
                producer,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

exports.removeproducer = (req, res) => {
    Producer.findOneAndUpdate(
        { _id: req.producer._id },
        { $set: { isDeleted: true } },
        { new: true },
    )
    .populate({
        path: 'producerId',
        populate: { path: 'producerId' },
    })
        .exec()
        .then((producer) => {
            if (!producer) {
                return res.status(404).json({
                    error: 'producer not found',
                });
            }

            return res.json({
                success: 'Remove producer successfully',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'producer not found',
            });
        });
};

exports.listActiveProducers = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const regex = search
        .split(' ')
        .filter((w) => w)
        .join('|');

    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order =
        req.query.order &&
        (req.query.order == 'asc' || req.query.order == 'desc')
            ? req.query.order
            : 'asc';

    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);

    const filter = {
        search,
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        name: { $regex: regex, $options: 'i' },
        isDeleted: false,
    };

    if (req.query.producerId) {
        filter.producerId = req.query.producerId;
        filterArgs.producerId =
            req.query.producerId === 'null' ? null : req.query.producerId;
    }
    
    Producer.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'List active producers not found',
            });
        }

        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;

        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }

        if (count <= 0) {
            return res.json({
                success: 'Load list active producers successfully',
                filter,
                size,
                producers: [],
            });
        }

        Producer.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'producerId',
                populate: { path: 'producerId' },
            })
            .exec()
            .then((producers) => {
                return res.json({
                    success: 'Load list active producers successfully',
                    filter,
                    size,
                    producers,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Load list active producers failed',
                });
            });
    });
};

exports.listProducers = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const regex = search
        .split(' ')
        .filter((w) => w)
        .join('|');

    const sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    const order =
        req.query.order &&
        (req.query.order == 'asc' || req.query.order == 'desc')
            ? req.query.order
            : 'asc';

    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);

    const filter = {
        search,
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        name: { $regex: regex, $options: 'i' },
    };

    if (req.query.producerId) {
        filter.producerId = req.query.producerId;
        filterArgs.producerId =
            req.query.producerId === 'null' ? null : req.query.producerId;
    }

    Producer.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'List categories not found',
            });
        }

        const size = count;
        const pageCount = Math.ceil(size / limit);
        filter.pageCount = pageCount;

        if (page > pageCount) {
            skip = (pageCount - 1) * limit;
        }

        if (count <= 0) {
            return res.json({
                success: 'Load list categories successfully',
                filter,
                size,
                categories: [],
            });
        }

        Producer.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'producerId',
                populate: { path: 'producerId' },
            })
            .exec()
            .then((producers) => {
                return res.json({
                    success: 'Load list categories successfully',
                    filter,
                    size,
                    producers,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Load list categories failed',
                });
            });
    });
};