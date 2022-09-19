const { check, oneOf } = require('express-validator');

const signup = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền họ')
        .isLength({ max: 20 })
        .withMessage('Họ chỉ có thể dài nhất 20 ký tự')
        .matches(
            /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/,
        )
        .withMessage(
            "Họ có thể chứa số, ký tự đặt biệt,....",
        ),

    check('lastname')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền tên')
        .isLength({ max: 20 })
        .withMessage('Tên có thể dài nhất 20 ký tự')
        .matches(
            /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/,
        )
        .withMessage(
            "Tên có thể chứa số, ký tự đặt biệt,....",
        ),

    oneOf(
        [
            [
                check('email').not().exists(),

                check('phone')
                    .not()
                    .isEmpty()
                    .matches(/^\d{10,11}$/),
            ],
            [
                check('phone').not().exists(),

                check('email')
                    .not()
                    .isEmpty()
                    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            ],
        ],
        'Vui lòng cung cấp ít nhất một trong hai thông tin số điện thoại hoặc email (email phải chứa @ và số điện thoại phải đủ 10 hoặc 11 số.)',
    ),

    check('password')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền mật khẩu!')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        )
        .withMessage(
            'Mật khẩu phải có ít nhất 6 ký tự, ít nhất 1 ký tự in hoa, 1 ký tự thường, 1 ký tự số và 1 ký tự đặt biệt như @, $, !, %, *, ?, &',
        ),
];

const signin = () => [
    oneOf(
        [
            [
                check('email').not().exists(),

                check('phone')
                    .not()
                    .isEmpty()
                    .matches(/^\d{10,11}$/),
            ],
            [
                check('phone').not().exists(),

                check('email')
                    .not()
                    .isEmpty()
                    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            ],
        ],
        'Vui lòng cung cấp ít nhất một trong hai thông tin số điện thoại hoặc email (email phải chứa @ và số điện thoại phải đủ 10 hoặc 11 số.)',
    ),

    check('password')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền mật khẩu')
        .matches(/^[A-Za-z\d@$!%*?&]*$/)
        .withMessage('Mật khẩu chứa ký tự không hợp lệ!'),
];

const forgotPassword = () => [
    oneOf(
        [
            [
                check('email').not().exists(),

                check('phone')
                    .not()
                    .isEmpty()
                    .matches(/^\d{10,11}$/),
            ],
            [
                check('phone').not().exists(),

                check('email')
                    .not()
                    .isEmpty()
                    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),
            ],
        ],
        'Vui lòng cung cấp ít nhất một trong hai thông tin số điện thoại hoặc email (email phải chứa @ và số điện thoại phải đủ 10 hoặc 11 số.)',
    ),
];

const changePassword = () => [
    check('password')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền mật khẩu!')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        )
        .withMessage(
            'Mật khẩu phải có ít nhất 6 ký tự, ít nhất 1 ký tự in hoa, 1 ký tự thường, 1 ký tự số và 1 ký tự đặt biệt như @, $, !, %, *, ?, &',
        ),
];

const authSocial = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền họ')
        .isLength({ max: 32 })
        .withMessage('Firstname can contain up to 32 characters'),

    check('lastname')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền tên')
        .isLength({ max: 32 })
        .withMessage('Lastname can contain up to 32 characters'),

    check('email').not().isEmpty().withMessage('Email is required'),
];


module.exports = {
    signup,
    signin,
    forgotPassword,
    changePassword,
    authSocial,
};
