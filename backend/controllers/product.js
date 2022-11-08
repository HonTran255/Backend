const Product = require('../models/product');
const Category = require('../models/category.js');
const Producer = require('../models/producer.js');
const fs = require('fs');
const { errorHandler } = require('../helpers/errorHandler');

exports.productById = (req, res, next, id) => {
    Product.findById(id, (error, product) => {
        if (error || !product) {
            return res.status(404).json({
                error: 'Không tìm thấy sản phẩm',
            });
        }

        req.product = product;
        next();
    });
};

exports.getProduct = (req, res) => {
    if (!req.product.isActive)
        return res.status(404).json({
            error: 'Không tìm thấy sản phẩm',
        });

    Product.findOne({ _id: req.product._id, isActive: true })
        .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' },
            },
        })
        .populate({
            path: 'producerId',
            populate: {
                path: 'producerId',
                populate: { path: 'producerId' },
            },
        })
        .exec()
        .then((product) => {
            if (!product) {
                return res.status(500).json({
                    error: 'Không tìm thấy sản phẩm',
                });
            }

            return res.json({
                success: 'Lấy sản phẩm thành công',
                product,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Không tìm thấy sản phẩm',
            });
        });
};

exports.createProduct = (req, res) => {
    const {
        name,
        description,
        price,
        promotionalPrice,
        quantity,
        categoryId,
        producerId,
    } = req.fields;
    const listImages = req.filepaths;
    if (
        !name ||
        !description ||
        !price ||
        !promotionalPrice ||
        !quantity ||
        !categoryId ||
        !producerId ||
        !listImages ||
        listImages.length <= 0
    ) {
        try {
            listImages.forEach((image) => {
                fs.unlinkSync('public' + image);
            });
        } catch {}

        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });
    }


    const product = new Product({
        name,
        description,
        price,
        promotionalPrice,
        quantity,
        categoryId,
        producerId,
        listImages,
    });

    product.save((error, product) => {
        if (error || !product) {
            try {
                listImages.forEach((image) => {
                    fs.unlinkSync('public' + image);
                });
            } catch {}

            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Tạo sản phẩm thành công',
            product,
        });
    });
};

exports.updateProduct = (req, res) => {
    const {
        name,
        description,
        price,
        promotionalPrice,
        quantity,
        categoryId,
        producerId,
    } = req.fields;

    if (
        !name ||
        !description ||
        !price ||
        !promotionalPrice ||
        !quantity ||
        !categoryId ||
        !producerId
    ) {
        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });
    }

    Product.findOneAndUpdate(
        { _id: req.product._id },
        {
            name,
            description,
            price,
            promotionalPrice,
            quantity,
            categoryId,
            producerId,
        },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' },
            },
        })
        .exec()
        .then((product) => {
            if (!product)
                return res.status(500).json({
                    error: 'Không tìm thấy sản phẩm',
                });

            return res.json({
                success: 'Cập nhật sản phẩm thành công',
                product,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};


/*------
  ACTIVE
  ------*/
exports.activeAllProduct = (req, res) => {
    const { isActive } = req.body;

    Product.updateMany(
        { $set: { isActive } },
        { new: true },
    )
        .exec()
        .then(() => {
            return res.json({
                success: 'Cập nhật thành công',
                store: req.store,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  ACTIVE
  ------*/
exports.activeProduct = (req, res) => {
    const { isActive } = req.body;

    Product.findOneAndUpdate(
        { _id: req.product._id },
        { $set: { isActive } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' },
            },
        })
        .populate({
            path: 'producerId',
            populate: {
                path: 'producerId',
                populate: { path: 'producerId' },
            },
        })
        .exec()
        .then((product) => {
            if (!product) {
                return res.status(500).json({
                    error: 'Không tìm thấy sản phẩm',
                });
            }

            return res.json({
                success: 'Cập nhật trạng thái thành công',
                product,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  LIST IMAGES
  ------*/
exports.addToListImages = (req, res) => {
    let listImages = req.product.listImages;

    const index = listImages.length;
    if (index >= 6) {
        try {
            fs.unlinkSync('public' + req.filepaths[0]);
        } catch {}

        return res.status(400).json({
            error: 'Giới hạn 6 ảnh',
        });
    }

    Product.findOneAndUpdate(
        { _id: req.product._id },
        { $push: { listImages: req.filepaths[0] } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' },
            },
        })
        .populate({
            path: 'producerId',
            populate: {
                path: 'producerId',
                populate: { path: 'producerId' },
            },
        })
        .exec()
        .then((product) => {
            if (!product) {
                try {
                    fs.unlinkSync('public' + req.filepaths[0]);
                } catch {}

                return res.status(500).json({
                    error: 'Không tìm thấy sản phẩm',
                });
            }

            return res.json({
                success: 'Thêm hình ảnh thành công',
                product,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepaths[0]);
            } catch {}

            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};

exports.updateListImages = (req, res) => {
    const index = req.query.index ? parseInt(req.query.index) : -1;
    const image = req.filepaths[0];

    if (index == -1 || !image)
        return res.status(400).json({
            error: 'Cập nhật hình ảnh thất bại',
        });

    let listImages = req.product.listImages;
    if (index >= listImages.length) {
        try {
            fs.unlinkSync('public' + image);
        } catch {}

        return res.status(404).json({
            error: 'Không tìm thấy ảnh',
        });
    }

    const oldpath = listImages[index];
    listImages[index] = image;

    Product.findOneAndUpdate(
        { _id: req.product._id },
        { $set: { listImages } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' },
            },
        })
        .populate({
            path: 'producerId',
            populate: {
                path: 'producerId',
                populate: { path: 'producerId' },
            },
        })
        .exec()
        .then((product) => {
            if (!product) {
                try {
                    fs.unlinkSync('public' + image);
                } catch {}

                return res.status(500).json({
                    error: 'Không tìm thấy sản phẩm',
                });
            }

            if (oldpath != '/uploads/default.jpg') {
                try {
                    fs.unlinkSync('public' + oldpath);
                } catch {}
            }

            return res.json({
                success: 'Cập nhật hình ảnh thành công',
                product,
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + image);
            } catch {}

            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removefromListImages = (req, res) => {
    const index = req.query.index ? parseInt(req.query.index) : -1;
    if (index == -1) {
        return res.status(400).json({
            error: 'Xóa ảnh thất bại',
        });
    }

    let listImages = req.product.listImages;
    if (index >= listImages.length) {
        return res.status(404).json({
            error: 'Không tìm thấy ảnh',
        });
    }

    if (listImages.length <= 1) {
        return res.status(400).json({
            error: 'Không được để trống',
        });
    }

    try {
        fs.unlinkSync('public' + listImages[index]);
    } catch (e) {}

    //update db
    listImages.splice(index, 1);

    Product.findOneAndUpdate(
        { _id: req.product._id },
        { $set: { listImages } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: {
                path: 'categoryId',
                populate: { path: 'categoryId' },
            },
        })
        .populate({
            path: 'producerId',
            populate: {
                path: 'producerId',
                populate: { path: 'producerId' },
            },
        })
        .exec()
        .then((product) => {
            if (!product) {
                return res.status(500).json({
                    error: 'Không tìm thấy sản phẩm',
                });
            }

            return res.json({
                success: 'Xóa ảnh thành công',
                product,
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  LIST PRODUCTS
  ------*/
exports.listProductCategories = (req, res, next) => {
    Product.distinct(
        'categoryId',
        { isActive: true },
        (error, categories) => {
            const categoryId = req.query.categoryId;
            console.log(categoryId, categories);

            if (categoryId) {
                const filterCategories = categories.filter((category) =>
                    category.equals(categoryId),
                );

                if (filterCategories.length > 0) {
                    req.loadedCategories = filterCategories;
                    next();
                } else {
                    Category.find({ _id: { $in: categories } })
                        .populate({
                            path: 'categoryId',
                            populate: { path: 'categoryId' },
                        })
                        .exec()
                        .then((newCategories) => {
                            const filterCategories = newCategories
                                .filter(
                                    (category) =>
                                        (category.categoryId &&
                                            category.categoryId._id ==
                                                categoryId) ||
                                        (category.categoryId &&
                                            category.categoryId.categoryId &&
                                            category.categoryId.categoryId
                                                ._id == categoryId),
                                )
                                .map((category) => category._id);

                            console.log(filterCategories);

                            req.loadedCategories = filterCategories;
                            next();
                        })
                        .catch((error) => {
                            req.loadedCategories = [];
                            next();
                        });
                }
            } else {
                req.loadedCategories = categories;
                next();
            }
        },
    );
};

exports.listProductProducers = (req, res, next) => {
    Product.distinct(
        'producerId',
        { isActive: true },
        (error, producers) => {

            const producerId = req.query.producerId;
            console.log(producerId, producers);

            if (producerId) {
                const filterProducers = producers.filter((producer) =>
                    producer.equals(producerId),
                );

                if (filterProducers.length > 0) {
                    req.loadedProducers = filterProducers;
                    next();
                } else {
                    Producer.find({ _id: { $in: producers } })
                        .populate({
                            path: 'producerId',
                            populate: { path: 'producerId' },
                        })
                        .exec()
                        .then((newProducers) => {
                            const filterProducers = newProducers
                                .filter(
                                    (producer) =>
                                        (producer.producerId &&
                                            producer.producerId._id ==
                                            producerId) ||
                                        (producer.producerId &&
                                            producer.producerId.producerId &&
                                            producer.producerId.producerId
                                                ._id == producerId),
                                )
                                .map((producer) => producer._id);

                            console.log(filterProducers);

                            req.loadedProducers = filterProducers;
                            next();
                        })
                        .catch((error) => {
                            req.loadedProducers = [];
                            next();
                        });
                }
            } else {
                req.loadedProducers = producers;
                next();
            }
        },
    );
};

exports.listProducts = (req, res) => {
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

    const categoryId = req.loadedCategories;

    const producerId = req.loadedProducers;

    const rating =
        req.query.rating && req.query.rating > 0 && req.query.rating < 6
            ? parseInt(req.query.rating)
            : -1;
    const minPrice =
        req.query.minPrice && req.query.minPrice > 0
            ? parseInt(req.query.minPrice)
            : -1;
    const maxPrice =
        req.query.maxPrice && req.query.maxPrice > 0
            ? parseInt(req.query.maxPrice)
            : -1;

    const filter = {
        search,
        sortBy,
        order,
        categoryId,
        producerId,
        limit,
        pageCurrent: page,
        rating: rating !== -1 ? rating : 'all',
        minPrice: minPrice !== -1 ? minPrice : 0,
        maxPrice: maxPrice !== -1 ? maxPrice : 'infinite',
    };

    const filterArgs = {
        $or: [
            { name: { $regex: regex, $options: 'i' } },
            { description: { $regex: regex, $options: 'i' } },
        ],
        categoryId: { $in: categoryId },
        producerId: { $in: producerId },
        isActive: true,
        promotionalPrice: { $gte: 0 },
        rating: { $gte: 0 },
    };

    if (rating !== -1) filterArgs.rating.$gte = rating;
    if (minPrice !== -1) filterArgs.promotionalPrice.$gte = minPrice;
    if (maxPrice !== -1) filterArgs.promotionalPrice.$lte = maxPrice;

    Product.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy sản phẩm',
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
                success: 'Tải danh sách sản phẩm thành công',
                filter,
                size,
                products: [],
            });
        }

        Product.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            })
            .populate({
                path: 'producerId',
                populate: {
                    path: 'producerId',
                    populate: { path: 'producerId' },
                },
            })
            .exec()
            .then((products) => {
                return res.json({
                    success: 'Tải danh sách sản phẩm thành công',
                    filter,
                    size,
                    products,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách sản phẩm thất bại',
                });
            });
    });
};


//for admin
exports.listProductsForAdmin = (req, res) => {
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

    let isActive = [true, false];
    if (req.query.isActive == 'true') isActive = [true];
    if (req.query.isActive == 'false') isActive = [false];

    const filter = {
        search,
        sortBy,
        order,
        isActive,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        name: { $regex: regex, $options: 'i' },
        description: { $regex: regex, $options: 'i' },
        isActive: { $in: isActive },
    };

    Product.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy',
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
                success: 'Tải sản phẩm thành công',
                filter,
                size,
                products: [],
            });
        }

        Product.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'categoryId',
                populate: {
                    path: 'categoryId',
                    populate: { path: 'categoryId' },
                },
            })
            .populate({
                path: 'producerId',
                populate: {
                    path: 'producerId',
                    populate: { path: 'producerId' },
                },
            })
            .exec()
            .then((products) => {
                return res.json({
                    success: 'Tải danh sách sản phẩm thành công',
                    filter,
                    size,
                    products,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách sản phẩm thất bại',
                });
            });
    });
};
