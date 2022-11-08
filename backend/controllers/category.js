const Category = require('../models/category');
const fs = require('fs');
const { errorHandler } = require('../helpers/errorHandler');

exports.categoryById = (req, res, next, id) => {
    Category.findById(id, (error, category) => {
        if (error || !category) {
            return res.status(404).json({
                error: 'Không tìm thấy danh mục',
            });
        }

        req.category = category;
        next();
    });
};

exports.getCategory = (req, res) => {
    Category.findOne({ _id: req.category._id })
        .populate({
            path: 'categoryId',
            populate: { path: 'categoryId' },
        })
        .exec()
        .then((category) => {
            if (!category)
                return res.status(500).json({
                    error: 'Tải danh mục thất bại',
                });

            return res.json({
                success: 'Tải danh mục thành công',
                category: category,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Tải danh mục thành công',
            });
        });
};

exports.checkCategory = (req, res, next) => {
    const { categoryId } = req.fields;
    if (categoryId) {
        Category.findOne({ _id: categoryId })
            .populate('categoryId')
            .exec()
            .then((category) => {
                if (
                    !category ||
                    (category.categoryId != null &&
                        category.categoryId.categoryId != null)
                ) {
                    try {
                        fs.unlinkSync('public' + req.filepaths[0]);
                    } catch {}

                    return res.status(400).json({
                        error: 'Không xác định',
                    });
                } else next();
            })
            .catch((error) => {
                try {
                    fs.unlinkSync('public' + req.filepaths[0]);
                } catch {}

                return res.status(400).json({
                    error: 'Không xác định',
                });
            });
    } else next();
};

exports.checkCategoryChild = (req, res, next) => {
    let { categoryId } = req.body;

    try {
        if (!categoryId) categoryId = req.fields.categoryId;
    } catch {}

    Category.findOne({ categoryId })
        .exec()
        .then((category) => {
            if (!category) next();
            else {
                try {
                    req.filepaths.forEach((path) => {
                        fs.unlinkSync('public' + path);
                    });
                } catch (err) {}

                return res.status(400).json({
                    error: 'Không xác định',
                });
            }
        })
        .catch((error) => next());
};

exports.checkListCategoriesChild = (req, res, next) => {
    const { categoryIds } = req.body;

    Category.findOne({ categoryId: { $in: categoryIds } })
        .exec()
        .then((category) => {
            if (!category) next();
            else
                return res.status(400).json({
                    error: 'Không xác định',
                });
        })
        .catch((error) => next());
};

exports.createCategory = (req, res) => {
    const { name, categoryId } = req.fields;
    const image = req.filepaths[0];
    if (!name || !image) {
        try {
            fs.unlinkSync('public' + req.filepaths[0]);
        } catch {}

        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });
    }

    const category = new Category({
        name,
        categoryId,
        image,
    });

    category.save((error, category) => {
        if (error || !category) {
            try {
                fs.unlinkSync('public' + req.filepaths[0]);
            } catch {}

            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Tạo danh mục thành công',
            category,
        });
    });
};

exports.updateCategory = (req, res) => {
    let { name, categoryId } = req.fields;
    const image = req.filepaths[0] ? req.filepaths[0] : req.category.image;
    if (!categoryId) categoryId = null;
    else if (categoryId == req.category._id) {
        return res.status(400).json({
            error: 'Không xác định',
        });
    }

    if (!name || !image) {
        try {
            fs.unlinkSync('public' + req.filepaths[0]);
        } catch {}

        return res.status(400).json({
            error: 'Thiếu dữ liệu',
        });
    }

    Category.findOneAndUpdate(
        { _id: req.category._id },
        { $set: { name, image, categoryId } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: { path: 'categoryId' },
        })
        .exec()
        .then((category) => {
            if (!category) {
                try {
                    fs.unlinkSync('public' + req.filepaths[0]);
                } catch {}

                return res.status(400).json({
                    error: errorHandler(error),
                });
            }

            return res.json({
                success: 'Cập nhật danh mục thành công',
                category,
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

exports.removeCategory = (req, res) => {
    Category.findOneAndUpdate(
        { _id: req.category._id },
        { $set: { isDeleted: true } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: { path: 'categoryId' },
        })
        .exec()
        .then((category) => {
            if (!category) {
                return res.status(404).json({
                    error: 'Không tim thấy danh mục',
                });
            }

            return res.json({
                success: 'Xóa danh mục thành công',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Không tim thấy danh mục',
            });
        });
};

exports.restoreCategory = (req, res) => {
    Category.findOneAndUpdate(
        { _id: req.category._id },
        { $set: { isDeleted: false } },
        { new: true },
    )
        .populate({
            path: 'categoryId',
            populate: { path: 'categoryId' },
        })
        .exec()
        .then((category) => {
            if (!category) {
                return res.status(404).json({
                    error: 'Không tìm thấy danh mục',
                });
            }

            return res.json({
                success: 'Hoàn danh mục thành công',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Không tìm thấy danh mục',
            });
        });
};

exports.listActiveCategories = (req, res) => {
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

    if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId;
        filterArgs.categoryId =
            req.query.categoryId === 'null' ? null : req.query.categoryId;
    }

    Category.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy danh sách danh mục',
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
                success: 'Tải danh mục thành công',
                filter,
                size,
                categories: [],
            });
        }

        Category.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'categoryId',
                populate: { path: 'categoryId' },
            })
            .exec()
            .then((categories) => {
                return res.json({
                    success: 'Tải danh mục thành công',
                    filter,
                    size,
                    categories,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh mục thất bại',
                });
            });
    });
};

exports.listCategories = (req, res) => {
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

    if (req.query.categoryId) {
        filter.categoryId = req.query.categoryId;
        filterArgs.categoryId =
            req.query.categoryId === 'null' ? null : req.query.categoryId;
    }

    Category.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy danh mục',
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
                success: 'Tải danh mục thành công',
                filter,
                size,
                categories: [],
            });
        }

        Category.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate({
                path: 'categoryId',
                populate: { path: 'categoryId' },
            })
            .exec()
            .then((categories) => {
                return res.json({
                    success: 'Tải danh mục thành công',
                    filter,
                    size,
                    categories,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh mục thất bại',
                });
            });
    });
};

