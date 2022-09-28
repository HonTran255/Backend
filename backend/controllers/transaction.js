const Transaction = require('../models/transaction');
const User = require('../models/user');
const { cleanUserLess, cleanUser } = require('../helpers/userHandler');
const { errorHandler } = require('../helpers/errorHandler');

exports.transactionById = (req, res, next, id) => {
    Transaction.findById(id, (error, transaction) => {
        if (error || !transaction) {
            return res.status(404).json({
                error: 'Transaction not found',
            });
        }

        req.transaction = transaction;
        next();
    });
};

exports.readTransaction = (req, res) => {
    Transaction.findOne({ _id: req.transaction._id })
        .populate('userId', '_id firstname lastname avatar')
        .populate('storeId', '_id name avatar isOpen isActive')
        .exec()
        .then((transaction) => {
            if (!transaction)
                return res.status(500).json({
                    error: 'Transaction not found',
                });
            return res.json({
                success: 'Read transaction successfully',
                transaction,
            });
        })
        .catch((error) => {
            return res.status(500).json({
                error: 'Transaction not found',
            });
        });
};

exports.requestTransaction = (req, res, next) => {
    console.log('Requesting transaction');
    const { isUp, code, amount } = req.body;

    if (
        ( !req.user) ||
        (isUp !== 'true' && isUp !== 'false') ||
        !amount
    )
        return res.status(400).json({
            error: 'All fields are required',
        });
    else {
        req.createTransaction = {
            isUp: isUp === 'true' ? true : false,
            code,
            amount,
        };
        if ( req.user) req.createTransaction.userId = req.user._id;
        // else req.createTransaction.storeId = req.store._id;
        next();
    }
};

exports.createTransaction = (req, res, next) => {
    console.log('---CREATE TRANSACTION ---');
    const { userId, isUp, code, amount } = req.createTransaction;

    if ((!userId ) || typeof isUp !== 'boolean' || !amount)
        return res.status(400).json({
            error: 'All fields are required!',
        });

    const transaction = new Transaction({
        userId,
       
        isUp,
        code,
        amount,
    });

    transaction.save((error, transaction) => {
        if (error || !transaction)
            return res.status(500).json({
                error: errorHandler(error),
            });
        else next();
    });
};

exports.listTransactions = (req, res) => {
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

    let filterArgs = {};
    if ( !req.user)
        return res.status(404).json({
            error: 'List transactions not found',
        });

    if ( req.user && req.user.role === 'user')
        filterArgs = { userId: req.user._id };

    Transaction.countDocuments(filterArgs, (error, count) => {
        if (error) {
            return res.status(404).json({
                error: 'List transactions not found',
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
                success: 'Load list transactions successfully',
                filter,
                size,
                transactions: [],
            });
        }

        Transaction.find(filterArgs)
            .sort({ [sortBy]: order, _id: 1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', '_id firstname lastname avatar')
            .populate('storeId', '_id name avatar isActive isOpen')
            .exec()
            .then((transactions) => {
                return res.json({
                    success: 'Load list transactions successfully',
                    filter,
                    size,
                    transactions,
                });
            })
            .catch((error) => {
                return res.status(500).json({
                    error: 'Load list transactions failed',
                });
            });
    });
};
