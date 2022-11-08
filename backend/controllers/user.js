const User = require('../models/user');
const fs = require('fs');
const { cleanUser, cleanUserLess } = require('../helpers/userHandler');
const { errorHandler } = require('../helpers/errorHandler');

/*------
  USER
  ------*/
exports.userById = (req, res, next, id) => {
    User.findById(id, (error, user) => {
        if (error || !user) {
            return res.status(404).json({
                error: 'Không tìm thấy người dùng',
            });
        }

        req.user = user;
        next();
    });
};

exports.getUser = (req, res) => {
    return res.json({
        success: 'Lấy người dùng thành công',
        user: cleanUser(req.user),
    });
};

exports.getUserProfile = (req, res) => {
    User.findOne({ _id: req.user._id })
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            return res.json({
                success: 'Lấy thông tin người dùng thành công',
                user: cleanUserLess(user),
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Không tìm thấy người dùng',
            });
        });
};

exports.updateProfile = (req, res) => {
    const { firstname, lastname, id_card, email, phone } = req.body;

    if (email && (req.user.googleId || req.user.facebookId)) {
        return res.status(400).json({
            error: 'Can not update Google/Facebook email address',
        });
    }

    const isEmailActive =
        email && req.user.email != email ? false : req.user.isEmailActive;
    const isPhoneActive =
        phone && req.user.phone != phone ? false : req.user.isPhoneActive;

    User.findOneAndUpdate(
        { _id: req.user._id },
        {
            $set: {
                firstname,
                lastname,
                id_card,
                email,
                phone,
                isEmailActive,
                isPhoneActive,
            },
        },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            return res.json({
                success: 'Cập nhật người dùng thành công.',
                user: cleanUserLess(user),
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.updatePassword = (req, res) => {
    let { newPassword } = req.body;

    const user = req.user;
    newPassword = user.encryptPassword(newPassword, user.salt);

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { hashed_password: newPassword } },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            return res.json({
                success: 'Cập nhật mật khẩu thành công',
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  ADDRESS
  ------*/
exports.addAddress = (req, res) => {
    let addresses = req.user.addresses;

    if (addresses.length >= 6) {
        return res.status(400).json({
            error: 'Giới hạn 6 ảnh',
        });
    }

    addresses.push(req.body.address.trim());
    addresses = [...new Set(addresses)];

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            return res.json({
                success: 'Thêm địa chỉ thành công',
                user: cleanUserLess(user),
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.updateAddress = (req, res) => {
    const addressIndex =
        req.query.index && req.query.index >= 0 && req.query.index <= 6
            ? parseInt(req.query.index)
            : -1;
    if (addressIndex == -1)
        return res.status(400).json({
            error: 'Không tìm thấy danh sách',
        });

    let addresses = req.user.addresses;
    if (addresses.length <= addressIndex)
        return res.status(404).json({
            error: 'Địa chỉ không tồn tại',
        });

    const index = addresses.indexOf(req.body.address.trim());
    if (index != -1 && index != addressIndex)
        return res.status(400).json({
            error: 'Đại chỉ đã tồn tại',
        });

    addresses.splice(addressIndex, 1, req.body.address.trim());
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            return res.json({
                success: 'Cập nhật địa chỉ thành công',
                user: cleanUserLess(user),
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

exports.removeAddress = (req, res) => {
    const addressIndex =
        req.query.index && req.query.index >= 0 && req.query.index <= 6
            ? parseInt(req.query.index)
            : -1;
    if (addressIndex == -1)
        return res.status(400).json({
            error: 'Không tìm thấy',
        });

    let addresses = req.user.addresses;
    if (addresses.length <= addressIndex)
        return res.status(404).json({
            error: 'Không tìm thấy địa chỉ',
        });

    addresses.splice(addressIndex, 1);
    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { addresses } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            return res.json({
                success: 'Xóa địa chỉ thành công',
                user: cleanUserLess(user),
            });
        })
        .catch((error) => {
            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};

/*------
  AVATAR
  ------*/
exports.updateAvatar = (req, res) => {
    const oldpath = req.user.avatar;

    User.findOneAndUpdate(
        { _id: req.user._id },
        { $set: { avatar: req.filepaths[0] } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                try {
                    fs.unlinkSync('public' + req.filepaths[0]);
                } catch {}

                return res.status(500).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            if (oldpath != '/uploads/default.jpg') {
                try {
                    fs.unlinkSync('public' + oldpath);
                } catch {}
            }

            return res.json({
                success: 'Cập nhật ảnh đại diện thành công',
                user: cleanUserLess(user),
            });
        })
        .catch((error) => {
            try {
                fs.unlinkSync('public' + req.filepaths[0]);
            } catch {}

            return res.status(400).json({
                error: errorHandler(error),
            });
        });
};



/*------
  LIST USERS
  ------*/
// users?search=...&sortBy=...&order=...&limit=...&page=...
exports.listUser = (req, res) => {
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
            : 'asc'; //desc

    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = (page - 1) * limit;

    const filter = {
        search,
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        $or: [
            { firstname: { $regex: regex, $options: 'i' } },
            { lastname: { $regex: regex, $options: 'i' } },
        ],
        role: { $ne: 'admin' },
    };

    User.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy người dùng',
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
                success: 'Tải danh sách người dùng thành công',
                filter,
                size,
                users: [],
            });
        }

        User.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .limit(limit)
            .skip(skip)
            .exec()
            .then((users) => {
                users.forEach((user) => {
                    user = cleanUser(user);
                });

                return res.json({
                    success: 'Tải danh sách người dùng thành công',
                    filter,
                    size,
                    users,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách người dùng thất bại',
                });
            });
    });
};

// list users for admin management
exports.listUserForAdmin = (req, res) => {
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
            : 'asc'; //desc
    const limit =
        req.query.limit && req.query.limit > 0 ? parseInt(req.query.limit) : 6;
    const page =
        req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 1;
    let skip = (page - 1) * limit;

    const filter = {
        search,
        sortBy,
        order,
        limit,
        pageCurrent: page,
    };

    const filterArgs = {
        $or: [
            { firstname: { $regex: regex, $options: 'i' } },
            { lastname: { $regex: regex, $options: 'i' } },
            { email: { $regex: regex, $options: 'i' } },
            { phone: { $regex: regex, $options: 'i' } },
        ],
        role: { $ne: 'admin' },
    };

    User.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'Không tìm thấy người dùng',
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
                success: 'Tải danh sách người dùng thành công',
                filter,
                size,
                users: [],
            });
        }

        User.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .exec()
            .then((users) => {
                users.forEach((user) => {
                    user = cleanUserLess(user);
                });

                return res.json({
                    success: 'Tải danh sách người dùng thành công',
                    filter,
                    size,
                    users,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Tải danh sách người dùng thất bại',
                });
            });
    });
};

//active user
