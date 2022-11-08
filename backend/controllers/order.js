const Order = require('../models/order');
const OrderItem = require('../models/orderItem');
const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const Product = require('../models/product');
const { cleanUserLess } = require('../helpers/userHandler');
const { errorHandler } = require('../helpers/errorHandler');

exports.orderById = (req, res, next, id) => {
    Order.findById(id, (error, order) => {
        if (error || !order) {
            return res.status(404).json({
                error: 'Không tìm thấy đơn hàng',
            });
        }

        req.order = order;
        next();
    });
};

exports.orderItemById = (req, res, next, id) => {
    OrderItem.findById(id, (error, orderItem) => {
        if (error || !orderItem) {
            return res.status(404).json({
                error: 'Không tìm thấy ID đơn hàng',
            });
        }

        req.orderItem = orderItem;
        next();
    });
};

//list
exports.listOrderItems = (req, res) => {
    OrderItem.find({ orderId: req.order._id })
        .populate({
            path: 'productId',
            populate: {
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            }
        })
        .exec()
        .then((items) => {
            return res.json({
                success: 'Tải danh sách đơn hàng thành công',
                items,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Tải danh sách đơn hàng thất bại',
            });
        });
};

exports.listOrderByUser = (req, res) => {
    const userId = req.user._id;

    const search = req.query.search ? req.query.search : '';
    const regex = '.*' + search + '.*';

    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order =
        req.query.order &&
        (req.query.order == 'asc' || req.query.order == 'desc')
            ? req.query.order
            : 'desc';

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
        userId,
        tempId: { $regex: regex, $options: 'i' },
    };

    if (req.query.status) {
        filter.status = req.query.status.split('|');
        filterArgs.status = {
            $in: req.query.status.split('|'),
        };
    }

    Order.aggregate(
        [
            {
                $addFields: {
                    tempId: { $toString: '$_id' },
                },
            },
            {
                $match: filterArgs,
            },
            {
                $group: {
                    _id: '$_id',
                    count: { $sum: 1 },
                },
            },
        ],
        (error, result) => {
            if (error) {
                return res.status(404).json({
                    error: 'Không tìm thấy danh sách đơn hàng của người dùng',
                });
            }

            // console.log(result, result.reduce((p, c) => p + c.count, 0), result.map(r => r._id));

            const size = result.reduce((p, c) => p + c.count, 0);
            const pageCount = Math.ceil(size / limit);
            filter.pageCount = pageCount;

            if (page > pageCount) {
                skip = (pageCount - 1) * limit;
            }

            if (size <= 0) {
                return res.json({
                    success: 'Tải danh sách đơn hàng của người dùng thành công',
                    filter,
                    size,
                    orders: [],
                });
            }

            Order.find({ _id: { $in: result.map((r) => r._id) } })
                .sort({ [sortBy]: order, _id: 1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', '_id firstname lastname avatar')
                .populate('deliveryId')
                .exec()
                .then((orders) => {
                    return res.json({
                        success: 'Tải danh sách đơn hàng của người dùng thành công',
                        filter,
                        size,
                        orders,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: 'Tải danh sách đơn hàng của người dùng thất bại',
                    });
                });
        },
    );
};


exports.listOrderForAdmin = (req, res) => {
    const search = req.query.search ? req.query.search : '';
    const regex = '.*' + search + '.*';

    const sortBy = req.query.sortBy ? req.query.sortBy : 'createdAt';
    const order =
        req.query.order &&
        (req.query.order == 'asc' || req.query.order == 'desc')
            ? req.query.order
            : 'desc';

    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = limit * (page - 1);

    const filter = {
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        tempId: { $regex: regex, $options: 'i' },
    };

    if (req.query.status) {
        filter.status = req.query.status.split('|');
        filterArgs.status = {
            $in: req.query.status.split('|'),
        };
    }

    Order.aggregate(
        [
            {
                $addFields: {
                    tempId: { $toString: '$_id' },
                },
            },
            {
                $match: filterArgs,
            },
            {
                $group: {
                    _id: '$_id',
                    count: { $sum: 1 },
                },
            },
        ],
        (error, result) => {
            if (error) {
                return res.status(404).json({
                    error: 'Không tìm thấy đơn hàng',
                });
            }

            const size = result.reduce((p, c) => p + c.count, 0);
            const pageCount = Math.ceil(size / limit);
            filter.pageCount = pageCount;

            if (page > pageCount) {
                skip = (pageCount - 1) * limit;
            }

            if (size <= 0) {
                return res.json({
                    success: 'Tải danh sách đơn hàng thành công',
                    filter,
                    size,
                    orders: [],
                });
            }

            Order.find({ _id: { $in: result.map((r) => r._id) } })
                .sort({ [sortBy]: order, _id: 1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', '_id firstname lastname avatar')
                .populate('deliveryId')
                .exec()
                .then((orders) => {
                    return res.json({
                        success: 'Tải danh sách đơn hàng thành công',
                        filter,
                        size,
                        orders,
                    });
                })
                .catch((error) => {
                    return res.status(500).json({
                        error: 'Tải danh sách đơn hàng thất bại',
                    });
                });
        },
    );
};

//CRUD
exports.createOrder = (req, res, next) => {
    const { userId } = req.cart;
    const {
        deliveryId,
        address,
        phone,
        amount,
        isPaidBefore,
    } = req.body;

    if (
        !userId ||
        !deliveryId ||
        !address ||
        !phone ||
        !amount
    )
        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });
        

    if (!userId.equals(req.user._id))
        return res.status(400).json({
            error: 'This is not right cart!',
        });

    const order = new Order({
        userId,
        address,
        deliveryId,
        phone,
        amount,
        isPaidBefore,
    });

    order.save((error, order) => {
        if (error || !order) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        } else {
            //creat order items
            req.order = order;
            next();
        }
    });
};

exports.createOrderItems = (req, res, next) => {
    CartItem.find({ cartId: req.cart._id })
        .exec()
        .then((items) => {
            // console.log('before', items);
            const newItems = items.map((item) => {
                return {
                    orderId: req.order._id,
                    productId: item.productId,
                    count: item.count,
                    isDeleted: item.isDeleted,
                };
            });
            // console.log('after', newItems);

            OrderItem.insertMany(newItems, (error, items) => {
                if (error)
                    return res.status(500).json({
                        error: errorHandler(error),
                    });
                else {
                    //remove cart
                    next();
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Create order items failed',
            });
        });
};

exports.removeCart = (req, res, next) => {
    Cart.findOneAndUpdate(
        { _id: req.cart._id },
        { isDeleted: true },
        { new: true },
    )
        .exec()
        .then((cart) => {
            if (!cart)
                return res.status(400).json({
                    error: 'Xóa giỏ hàng thất bại',
                });
            //remove all cart items
            else next();
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Xóa giỏ hàng thất bại',
            });
        });
};

exports.removeAllCartItems = (req, res) => {
    CartItem.deleteMany({ cartId: req.cart._id }, (error, items) => {
        if (error)
            return res.status(400).json({
                error: 'Xóa sản phẩm thất bại',
            });
        else
            return res.json({
                success: 'Tạo đơn hàng thành công',
                order: req.order,
                user: cleanUserLess(req.user),
            });
    });
};

exports.checkOrderAuth = (req, res, next) => {
    if (req.user.role === 'admin') next();
    else if (
        req.user._id.equals(req.order.userId)
    )
        next();
    else
        return res.status(401).json({
            error: 'That is not right order!',
        });
};

exports.readOrder = (req, res) => {
    Order.findOne({ _id: req.order._id })
        .populate('userId', '_id firstname lastname avatar')
        .populate('deliveryId')
        .exec()
        .then((order) => {
            if (!order)
                return res.status(500).json({
                    error: 'Không tìm thấy',
                });

            return res.json({
                success: 'read order successfully',
                order,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Không tìm thấy',
            });
        });
};

// 'Not processed' --> 'Cancelled' (in 1h)
exports.updateStatusForUser = (req, res, next) => {
    const currentStatus = req.order.status;
    if (currentStatus !== '0')
        return res.status(401).json({
            error: 'Đơn hàng này đã được xử lý',
        });

    const time = new Date().getTime() - new Date(req.order.createdAt).getTime();
    const hours = Math.floor(time / 1000) / 3600;
    if (hours >= 1) {
        return res.status(401).json({
            error: 'Đã hết thời gian chỉnh sửa',
        });
    }

    const { status } = req.body;
    if (status !== '4')
        return res.status(401).json({
            error: 'Không ',
        });

    Order.findOneAndUpdate(
        { _id: req.order._id },
        { $set: { status } },
        { new: true },
    )
        .populate('userId', '_id firstname lastname avatar')
        .populate('deliveryId')
        .exec()
        .then((order) => {
            if (!order)
                return res.status(500).json({
                    error: 'Không tìm thấy',
                });

            if (order.status === 'Cancelled') {
                req.updatePoint = {
                    userId: req.order.userId,
                    point: -1,
                };

                if (order.isPaidBefore === true)
                    req.createTransaction = {
                        userId: order.userId,
                        isUp: true,
                        amount: order.amountFromUser,
                    };

                next();
            }

            return res.json({
                success: 'Cập nhật giỏ hàng thành công',
                order,
                user: cleanUserLess(req.user),
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Cập nhật thất bại',
            });
        });
};

exports.updateStatusForAdmin = (req, res, next) => {

    const { status } = req.body;
    if (
        status !== '1' &&
        status !== '2' &&
        status !== '3'
    )
        return res.status(401).json({
            error: 'Đơn hàng đã bị hủy!!',
        });

    Order.findOneAndUpdate(
        { _id: req.order._id },
        { $set: { status } },
        { new: true },
    )
        .populate('userId', '_id firstname lastname avatar')
        .populate('deliveryId')
        .exec()
        .then((order) => {
            if (!order)
                return res.status(500).json({
                    error: 'Không tìm thấy',
                });
            else
                return res.json({
                    success: 'Cập nhật đơn hàng thành công',
                    order,
                });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Cập nhật đơn hàng thất bại',
            });
        });
};

exports.updateQuantitySoldProduct = (req, res, next) => {
    OrderItem.find({ orderId: req.order._id })
        .exec()
        .then((items) => {
            let list = [];
            items.forEach((item) => {
                const temp = list.map((element) => element.productId);
                const index = temp.indexOf(item.productId);
                if (index === -1)
                    list.push({ productId: item.productId, count: item.count });
                else {
                    list[index].count += item.count;
                }
            });

            // console.log(items, list);

            let bulkOps = list.map((element) => {
                return {
                    updateOne: {
                        filter: { _id: element.productId },
                        update: {
                            $inc: {
                                quantity: -element.count,
                                sold: +element.count,
                            },
                        },
                    },
                };
            });

            Product.bulkWrite(bulkOps, {}, (error, products) => {
                if (error) {
                    return res.status(400).json({
                        error: 'Không thể cập nhật sản phẩm',
                    });
                }

                return res.json({
                    success: 'Cập nhật sản phẩm thành công',
                    order: req.order,
                });
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Không thể cập nhật số lượng',
            });
        });

    next();
};

exports.countOrders = (req, res) => {
    const filterArgs = {};
    if (req.query.status)
        filterArgs.status = {
            $in: req.query.status.split('|'),
        };
    if (req.query.userId) filterArgs.userId = req.query.userId;


    Order.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.json({
                success: 'Count order successfully',
                count: 0,
            });
        }

        return res.json({
            success: 'Count order successfully',
            count,
        });
    });
};

