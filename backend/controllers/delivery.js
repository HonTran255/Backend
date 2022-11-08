const Delivery = require('../models/delivery');
const { errorHandler } = require('../helpers/errorHandler');

exports.deliveryById = (req, res, next, id) => {
    Delivery.findById(id, (error, delivery) => {
        if (error || !delivery) {
            return res.status(404).json({
                error: 'Không tìm thấy đơn vị vận chuyển',
            });
        }

        req.delivery = delivery;
        next();
    });
};

exports.readDelivery = (req, res) => {
    if (req.delivery.isDeleted)
        return res.status(404).json({
            error: 'Không tìm thấy đơn vị vận chuyển',
        });
    else
        return res.json({
            success: 'read delivery successfully',
            delivery: req.delivery,
        });
};

exports.createDelivery = (req, res) => {
    const { name, price, description } = req.body;

    if (!name || !price || !description)
        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });

    const delivery = new Delivery({
        name,
        price,
        description,
    });

    delivery.save((error, delivery) => {
        if (error || !delivery) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Tạo đơn vị vận chuyển thành công',
            delivery,
        });
    });
};

exports.updateDelivery = (req, res) => {
    const { name, price, description } = req.body;

    if (!name || !price || !description)
        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });

    Delivery.findOneAndUpdate(
        { _id: req.delivery._id },
        { $set: { name, price, description } },
        { new: true },
    )
        .exec()
        .then((delivery) => {
            if (!delivery) {
                return res.status(500).json({
                    error: 'Không tìm thấy đơn vị vận chuyển',
                });
            }

            return res.json({
                success: 'Cập nhật đơn vị vận chuyển thành công',
                delivery,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removeDelivery = (req, res) => {
    Delivery.findOneAndUpdate(
        { _id: req.delivery._id },
        { $set: { isDeleted: true } },
        { new: true },
    )
        .exec()
        .then((delivery) => {
            if (!delivery) {
                return res.status(500).json({
                    error: 'Không tìm thấy đơn vị vận chuyển',
                });
            }

            return res.json({
                success: 'Xóa đơn vị vận chuyển thành công',
                delivery,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.restoreDelivery = (req, res) => {
    Delivery.findOneAndUpdate(
        { _id: req.delivery._id },
        { $set: { isDeleted: false } },
        { new: true },
    )
        .exec()
        .then((delivery) => {
            if (!delivery) {
                return res.status(500).json({
                    error: 'Không tìm thấy đơn vị vận chuyển',
                });
            }

            return res.json({
                success: 'Hoàn đơn vị vận chuyển thành công',
                delivery,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.listActiveDeliveries = (req, res) => {
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
        $or: [
            { name: { $regex: regex, $options: 'i' } },
            { description: { $regex: regex, $options: 'i' } },
        ],
        isDeleted: false,
    };

    Delivery.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy danh sách',
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
                success: 'Tải danh sách thành công',
                filter,
                size,
                deliveries: [],
            });
        }

        Delivery.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
            .then((deliveries) => {
                return res.json({
                    success: 'Tải danh sách thành công',
                    filter,
                    size,
                    deliveries,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách thất bại',
                });
            });
    });
};

exports.listDeliveries = (req, res) => {
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
        $or: [
            { name: { $regex: regex, $options: 'i' } },
            { description: { $regex: regex, $options: 'i' } },
        ],
    };

    Delivery.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy danh sách',
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
                success: 'Tải danh sách thành công',
                filter,
                size,
                deliveries: [],
            });
        }

        Delivery.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
            .then((deliveries) => {
                return res.json({
                    success: 'Tải danh sách thành công',
                    filter,
                    size,
                    deliveries,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách thất bại',
                });
            });
    });
};
