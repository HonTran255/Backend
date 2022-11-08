const { check, oneOf } = require('express-validator');

const signup = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Hãy nhập họ')
        .isLength({ max: 32 })
        .withMessage('Họ có thể chứa 32 ký tự')
        .matches(
            /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/,
        )
        .withMessage(
            "Họ có thể chứa số hoặc một số ký tự đặc biệt như _, ', - và khoảng cách",
        )
        .custom(checkStoreName),

    check('lastname')
        .not()
        .isEmpty()
        .withMessage('Hãy nhập tên')
        .isLength({ max: 32 })
        .withMessage('Tên có thể chứa 32 ký tự')
        .matches(
            /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/,
        )
        .withMessage(
            "Tên có thể chứa số hoặc một số ký tự đặc biệt như _, ', - và khoảng cách",
        )
        .custom(checkStoreName),

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
        'Hãy nhập email hoặc số điện thoại',
    ),

    check('password')
        .not()
        .isEmpty()
        .withMessage('Hãy nhập mật khẩu')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        )
        .withMessage(
            'Mật khẩu phải chứa ít nhất 6 ký tự, 1 ký tự thường, 1 ký tự hoa, 1 chữ số và 1 ký tự đặc biệt như @, $, !, %, *, ?, &',
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
        'Hãy nhập email hoặc số điện thoại',
    ),

    check('password')
        .not()
        .isEmpty()
        .withMessage('Hãy nhập mật khẩu')
        .matches(/^[A-Za-z\d@$!%*?&]*$/)
        .withMessage('Password contains invalid characters'),
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
        'Hãy nhập email hoặc số điện thoại',
    ),
];

const changePassword = () => [
    check('password')
        .not()
        .isEmpty()
        .withMessage('Hãy nhập mật khẩu')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        )
        .withMessage(
            'Mật khẩu phải chứa ít nhất 6 ký tự, 1 ký tự thường, 1 ký tự hoa, 1 chữ số và 1 ký tự đặc biệt như @, $, !, %, *, ?, &',
        ),
];

const authSocial = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Hãy nhập họ')
        .isLength({ max: 32 })
        .withMessage('Họ có thể dài 32 ký tự'),

    check('lastname')
        .not()
        .isEmpty()
        .withMessage('Lastname is required')
        .isLength({ max: 32 })
        .withMessage('Tên có thể dài 32 ký tự'),

    check('email').not().isEmpty().withMessage('Hãy nhập email'),
];

//custom validator
const checkStoreName = (val) => {
    const regexes = [/g[o0][o0]d[^\w]*deal/i];

    let flag = true;
    regexes.forEach((regex) => {
        if (regex.test(val)) {
            flag = false;
        }
    });

    if (!flag) {
        return Promise.reject('Tên chứa ký tự không hợp lệ');
    }

    return true;
};

module.exports = {
    signup,
    signin,
    forgotPassword,
    changePassword,
    authSocial,
};
