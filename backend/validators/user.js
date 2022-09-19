const { check, oneOf } = require('express-validator');

const updateProfile = () => [
    check('firstname')
        .not()
        .isEmpty()
        .withMessage('Vui lòng điền họ')
        .isLength({ max: 20 })
        .withMessage('Họ có thể chứa 20 ký tự')
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
        .isLength({ max: 32 })
        .withMessage('Tên có thể chứa 20 ký tự')
        .matches(
            /^[A-Za-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđÁÀẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÉÈẺẼẸÊẾỀỂỄỆÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÍÌỈĨỊÚÙỦŨỤƯỨỪỬỮỰÝỲỶỸỴĐ\d\s_'-]*$/,
        )
        .withMessage(
            "Tên có thể chứa số, ký tự đặt biệt,....",
        ),

    oneOf(
        [
            check('id_card')
                .not()
                .isEmpty()
                .matches(/(^\d{9}$|^\d{12}$)/),

            check('id_card').not().exists(),
        ],
        'Id_card must contain 9 or 12 numbers',
    ),

    oneOf(
        [
            check('email')
                .not()
                .isEmpty()
                .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/),

            check('email').not().exists(),
        ],
        'Email phải chứa @',
    ),

    oneOf(
        [
            check('phone')
                .not()
                .isEmpty()
                .matches(/^\d{10,11}$/),

            check('phone').not().exists(),
        ],
        'Số điện thoại phải có 10 or 11 chữ số',
    ),
];

const updateAccount = () => [
    check('currentPassword')
        .not()
        .isEmpty()
        .withMessage('Vui lòng nhập mật khẩu hiện tại.')
        .matches(/^[A-Za-z\d@$!%*?&]*$/)
        .withMessage('Mật khẩu hiện tại chứa ký tự không hợp lệ'),

    check('newPassword')
        .not()
        .isEmpty()
        .withMessage('Vui lòng nhập mật khẩu mới')
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
        )
        .withMessage(
            'Mật khẩu mới phải có ít nhất 6 ký tự, ít nhất 1 ký tự in hoa, 1 ký tự thường, 1 ký tự số và 1 ký tự đặt biệt như @, $, !, %, *, ?, &',
        ),
];

const userAddress = () => [
    check('address')
        .not()
        .isEmpty()
        .withMessage('Vui lòng nhập địa chỉ')
        .isLength({ max: 200 })
        .withMessage('Địa chỉ có thể chứa đến 200 ký tự'),
];

module.exports = {
    updateProfile,
    updateAccount,
    userAddress,
};
