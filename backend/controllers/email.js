const User = require('../models/user');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const { errorHandler } = require('../helpers/errorHandler');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
});

exports.sendChangePasswordEmail = (req, res, next) => {
    console.log('---SEND CHANGE PASSWORD EMAIL---');
    const { email, phone, name, title, text, code } = req.msg;
    if (!email && phone) {
        next();
    } else if (!email && !phone) {
        console.log('---NO EMAIL PROVIDED---');
    } else {
        transport
            .sendMail({
                from: process.env.ADMIN_EMAIL,
                to: email,
                subject: `Dunne Figure - ${title}`,
                html: `<div>
                    <h2>A-Z Figure</h2>
                    <h1>${title}</h1>
                    <p>Hi ${name},</p>
                    <p>Cảm ơn bạn đã lựa chọn A-Z Figure.</p>
                    <p>${text}</p>
                    ${
                        code
                            ? `<button style="background-color:#0d6efd; border:none; border-radius:4px; padding:0;">
                            <a 
                                style="color:#fff; text-decoration:none; font-size:16px; padding: 16px 32px; display: inline-block;"
                                href='http://localhost:${process.env.CLIENT_PORT_2}/change/password/${code}'
                            >
                            Thay đổi mật khẩu!
                            </a>
                        </button>
                        `
                            : ''
                    }
                </div>`,
            })
            .then(() => {
                console.log('---SEND EMAIL SUCCESSFULLY---');
            })
            .catch((error) => {
                console.log('---SEND EMAIL FAILED---', error);
            });
    }
};

exports.verifyEmail = (req, res) => {
    User.findOneAndUpdate(
        { email_code: req.params.emailCode },
        { $set: { isEmailActive: true }, $unset: { email_code: '' } },
    )
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(500).json({
                    error: 'User not found',
                });
            }

            return res.json({
                success: 'Confirm email successfully',
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: errorHandler(error),
            });
        });
};
