const Cart = require('../models/cart');
const CartItem = require('../models/cartItem');
const { cleanUserLess } = require('../helpers/userHandler');

exports.cartById = (req, res, next, id) => {
    Cart.findById(id, (error, cart) => {
        if (error || !cart) {
            return res.status(404).json({
                error: 'Không tìm thấy giỏ hàng',
            });
        }

        req.cart = cart;
        next();
    });
};

exports.cartItemById = (req, res, next, id) => {
    CartItem.findById(id, (error, cartItem) => {
        if (error || !cartItem) {
            return res.status(404).json({
                error: 'Không tìm thấy sản phẩm',
            });
        }

        req.cartItem = cartItem;
        next();
    });
};

exports.createCart = (req, res, next) => {
    Cart.findOneAndUpdate(
        { userId: req.user._id },
        { isDeleted: false },
        { upsert: true, new: true },
    )
        .exec()
        .then((cart) => {
            if (!cart)
                return res.status(400).json({
                    error: 'Tạo giỏ hàng thất bại',
                });
            else {
                //create cart item
                req.cart = cart;
                next();
            }
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Tạo giỏ hàng thất bại',
            });
        });
};

exports.createCartItem = (req, res, next) => {
    const { productId, count } = req.body;

    if (!productId || !count) {
        const cartId = req.cartItem.cartId;
        CartItem.countDocuments({ cartId }, (error, count) => {
            if (count <= 0) {
                //remove cart
                req.cartId = cartId;
                next();
            } else {
                return res.status(400).json({
                    error: 'Thiếu dữ liệu',
                });
            }
        });
    }

    CartItem.findOneAndUpdate(
        { productId, cartId: req.cart._id },
        { $inc: { count: +count } },
        { upsert: true, new: true },
    )
        .populate({
            path: 'productId',
            populate: {
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            },
        })
        .exec()
        .then((item) => {
            if (!item)
                return res.status(400).json({
                    error: 'Tạo giỏ hàng thất bại',
                });
            else
                return res.json({
                    success: 'Thêm giỏ hàng thành công',
                    item,
                    user: cleanUserLess(req.user),
                });
        });
};

exports.listCarts = (req, res) => {
    const userId = req.user._id;
    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = (page - 1) * limit;

    const filter = {
        limit,
        pageCurrent: page,
    };

    Cart.countDocuments({ userId, isDeleted: false }, (error, count) => {
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
                success: 'Tải danh sách giỏ hàng thành công',
                filter,
                size,
                carts: [],
            });
        }

        Cart.find({ userId, isDeleted: false })
            .sort({ name: 1, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
            .then((carts) => {
                return res.json({
                    success: 'Tải danh sách giỏ hàng thành công',
                    filter,
                    size,
                    carts,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách giỏ hàng thất bại',
                });
            });
    });
};

exports.listItemByCard = (req, res) => {
    CartItem.find({ cartId: req.cart._id })
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
                success: 'Tải danh sách giỏ hàng thành công',
                items,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Tải danh sách giỏ hàng thất bại',
            });
        });
};

exports.updateCartItem = (req, res) => {
    const { count } = req.body;

    CartItem.findOneAndUpdate(
        { _id: req.cartItem._id },
        { $set: { count } },
        { new: true },
    )
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
        .then((item) => {
            return res.json({
                success: 'Cập nhật thành công',
                item,
                user: cleanUserLess(req.user),
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Cập nhật thất bại',
            });
        });
};

exports.removeCartItem = (req, res, next) => {
    CartItem.deleteOne({ _id: req.cartItem._id })
        .exec()
        .then(() => {
            const cartId = req.cartItem.cartId;
            CartItem.countDocuments({ cartId }, (error, count) => {
                if (count <= 0) {
                    //remove cart
                    req.cartId = cartId;
                    next();
                } else {
                    return res.json({
                        success: 'Xóa sản phẩm thành công',
                        user: cleanUserLess(req.user),
                    });
                }
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Xóa sản phẩm thất bại',
            });
        });
};

exports.removeCart = (req, res) => {
    Cart.findOneAndUpdate(
        { _id: req.cartId },
        { isDeleted: true },
        { new: true },
    )
        .exec()
        .then((cart) => {
            if (!cart)
                return res.status(400).json({
                    error: 'Xóa sản phẩm thất bại',
                });
            return res.json({
                success: 'Xóa sản phẩm thành công',
                cart,
                user: cleanUserLess(req.user),
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: 'Xóa sản phẩm thất bại',
            });
        });
};

exports.countCartItems = (req, res) => {
    CartItem.aggregate(
        [
            {
                $lookup: {
                    from: 'carts',
                    localField: 'cartId',
                    foreignField: '_id',
                    as: 'carts',
                },
            },
            {
                $group: {
                    _id: '$carts.userId',
                    count: {
                        $sum: '$count',
                    },
                },
            },
        ],
        (error, result) => {
            if (error)
                return res.status(500).json({
                    error: 'Đếm thất bại',
                });

            const findedResult = result.find((r) =>
                r._id[0].equals(req.user._id),
            );
            const count = findedResult ? findedResult.count : 0;

            // console.log(result, findedResult);

            return res.status(200).json({
                success: 'Đếm thành công',
                count,
            });
        },
    );
};
