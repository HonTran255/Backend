const User = require('../models/user');
const RefreshToken = require('../models/refreshToken');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

exports.signup = (req, res) => {
    const { firstname, lastname, email, phone, password } = req.body;
    const user = new User({ firstname, lastname, email, phone, password });
    user.save((error, user) => {
        if (error || !user) {
            return res.status(400).json({
                error: errorHandler(error),
            });
        }

        return res.json({
            success: 'Đăng ký thành công, bạn có thể đăng nhập ngay bây giờ',
        });
    });
};

exports.signin = (req, res, next) => {
    const { email, phone, password } = req.body;

    User.findOne({
        $or: [
            {
                email: { $exists: true, $ne: null, $eq: email },
                googleId: { $exists: false, $eq: null },
                facebookId: { $exists: false, $eq: null },
            },
            {
                phone: { $exists: true, $ne: null, $eq: phone },
                googleId: { $exists: false, $eq: null },
                facebookId: { $exists: false, $eq: null },
            },
        ],
    })
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            if (!user.authenticate(password)) {
                return res.status(401).json({
                    error: "Mật khẩu không chính xác",
                });
            }

            //create token
            req.auth = user;
            next();
        })
        .catch((error) => {
            res.status(404).json({
                error: 'Không tìm thấy người dùng',
            });
        });
};

exports.createToken = (req, res) => {
    const user = req.auth;

    const accessToken = jwt.sign(
        { _id: user._id },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '48h' },
    );

    const refreshToken = jwt.sign(
        { _id: user._id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '9999 days' },
    );

    const token = new RefreshToken({ jwt: refreshToken });
    token.save((error, t) => {
        if (error) {
            return res.status(500).json({
                error: 'Tạo JWT thất bại, hãy thử lại lần nữa',
            });
        }

        return res.json({
            success: 'Đăng nhập thành công',
            accessToken,
            refreshToken,
            _id: user._id,
            role: user.role,
        });
    });
};

exports.signout = (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (refreshToken == null)
        return res.status(401).json({ error: 'refreshToken is required' });

    RefreshToken.deleteOne({ jwt: refreshToken })
        .exec()
        .then(() => {
            return res.json({
                success: 'Đăng xuất thành công',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Sign out and remove refresh token failed',
            });
        });
};

exports.refreshToken = (req, res) => {
    const refreshToken = req.body.refreshToken;

    if (refreshToken == null)
        return res.status(401).json({ error: 'refreshToken is required' });

    RefreshToken.findOne({ jwt: refreshToken })
        .exec()
        .then((token) => {
            if (!token) {
                return res.status(404).json({
                    error: 'refreshToken is invalid',
                });
            } else {
                const decoded = jwt.decode(token.jwt);

                const accessToken = jwt.sign(
                    { _id: decoded._id },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: '48h' },
                );

                const newRefreshToken = jwt.sign(
                    { _id: decoded._id },
                    process.env.REFRESH_TOKEN_SECRET,
                    { expiresIn: '9999 days' },
                );

                RefreshToken.findOneAndUpdate(
                    { jwt: refreshToken },
                    { $set: { jwt: newRefreshToken } },
                )
                    .exec()
                    .then((t) => {
                        if (!t) {
                            return res.status(500).json({
                                error: 'Create JWT failed, try again later',
                            });
                        }

                        return res.json({
                            success: 'Refresh token successfully',
                            accessToken,
                            refreshToken: newRefreshToken,
                        });
                    })
                    .catch((error) => {
                        return res.status(500).json({
                            error: 'Create JWT failed,try again later',
                        });
                    });
            }
        })
        .catch((error) => {
            return res.status(401).json({
                error: 'refreshToken is invalid',
            });
        });
};

exports.forgotPassword = (req, res, next) => {
    const { email, phone } = req.body;

    const forgot_password_code = jwt.sign(
        { email, phone },
        process.env.JWT_FORGOT_PASSWORD_SECRET,
    );

    User.findOneAndUpdate(
        {
            $or: [
                { email: { $exists: true, $ne: null, $eq: email } },
                { phone: { $exists: true, $ne: null, $eq: phone } },
            ],
        },
        { $set: { forgot_password_code } },
        { new: true },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            //send email or phone
            const msg = {
                email: email ? email : '',
                phone: phone ? phone : '',
                name: user.firstname + ' ' + user.lastname,
                title: 'Request to change password',
                text: 'Please click on the following link to change your password.',
                code: forgot_password_code,
            };
            req.msg = msg;
            next();

            return res.json({
                success: 'Request successfully, waiting for email or sms',
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'User not found',
            });
        });
};

exports.changePassword = (req, res) => {
    const forgot_password_code = req.params.forgotPasswordCode;
    const { password } = req.body;

    User.findOneAndUpdate(
        { forgot_password_code: forgot_password_code },
        { $unset: { forgot_password_code: '' } },
    )
        .then((user) => {
            if (!user) {
                return res.status(404).json({
                    error: 'Không tìm thấy người dùng',
                });
            }

            user.hashed_password = user.encryptPassword(password, user.salt);
            user.save((e, u) => {
                if (e) {
                    return res.status(500).json({
                        error: 'Cập nhật mật khẩu thất bại',
                    });
                }
                return res.json({
                    success: 'Cập nhật thành công',
                });
            });
        })
        .catch((error) => {
            return res.status(404).json({
                error: 'Không tìm thấy người dùng',
            });
        });
};

exports.authSocial = (req, res, next) => {
    const { googleId, facebookId } = req.body;

    if (!googleId && !facebookId)
        return res.status(400).json({
            error: 'googleId or facebookId is required',
        });

    User.findOne({
        $or: [
            { googleId: { $exists: true, $ne: null, $eq: googleId } },
            { facebookId: { $exists: true, $ne: null, $eq: facebookId } },
        ],
    })
        .exec()
        .then((user) => {
            if (!user) {
                next();
            } else {
                req.auth = user;
                next();
            }
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Đăng nhập Google thất bại',
            });
        });
};

exports.authUpdate = (req, res, next) => {
    if (req.auth) next();
    else {
        const { firstname, lastname, email, googleId, facebookId } = req.body;

        if (googleId) {
            User.findOneAndUpdate(
                { email, facebookId: { $exists: true, $ne: null } },
                { $set: { googleId } },
                { new: true },
            )
                .exec()
                .then((user) => {
                    if (!user) {
                        const newUser = new User({
                            firstname,
                            lastname,
                            email,
                            googleId,
                            facebookId,
                            isEmailActive: true,
                        });
                        newUser.save((error, u) => {
                            if (error) {
                                return res.status(400).json({
                                    error: errorHandler(error),
                                });
                            }
                            req.auth = u;
                            next();
                        });
                    } else {
                        req.auth = user;
                        next();
                    }
                })
                .catch((error) => {
                    next();
                });
        }

        if (facebookId) {
            User.findOneAndUpdate(
                { email, googleId: { $exists: true, $ne: null } },
                { $set: { facebookId } },
                { new: true },
            )
                .exec()
                .then((user) => {
                    if (!user) {
                        const newUser = new User({
                            firstname,
                            lastname,
                            email,
                            googleId,
                            facebookId,
                            isEmailActive: true,
                        });
                        newUser.save((error, u) => {
                            if (error) {
                                return res.status(400).json({
                                    error: errorHandler(error),
                                });
                            }
                            req.auth = u;
                            next();
                        });
                    } else {
                        req.auth = user;
                        next();
                    }
                })
                .catch((error) => {
                    next();
                });
        }
    }
};

//check current password
exports.verifyPassword = (req, res, next) => {
    const { currentPassword } = req.body;
    User.findById(req.user._id, (error, user) => {
        if (error || !user) {
            return res.status(404).json({
                error: 'User not found',
            });
        }

        if (!user.authenticate(currentPassword)) {
            return res.status(401).json({
                error: "Current password doesn't match",
            });
        } else next();
    });
};

exports.isAuth = (req, res, next) => {
    if (
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(' ')[1]
    ) {
        const token = req.headers.authorization.split(' ')[1];
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
            if (error) {
                return res.status(401).json({
                    error: 'Hãy đăng nhập lại',
                });
            }

            if (req.user._id == decoded._id) {
                next();
            } else {
                return res.status(403).json({
                    error: 'Liên kết bị từ chối',
                });
            }
        });
    } else {
        return res.status(401).json({
            error: 'Hãy đăng nhập lại',
        });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Liên kết bị từ chôi',
        });
    }
    next();
};
