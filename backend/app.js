const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
require('dotenv').config();

//import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const userFollowProductRoutes = require('./routes/userFollowProduct');
const categoryRoutes = require('./routes/category');
const productRoutes = require('./routes/product');
const cartRoutes = require('./routes/cart');
const deliveryRoutes = require('./routes/delivery');
const orderRoutes = require('./routes/order');
const transactionRoutes = require('./routes/transaction');
const reviewRoutes = require('./routes/review');
const producerRoutes = require('./routes/producer');

//app
const app = express();

//db
mongoose.connect(process.env.DATABASE, (error) => {
    if (error) throw error;
    console.log('DB connected!');
});

//middlewares
app.use(morgan('dev'));
app.use('/static',express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
    cors({
        origin: [
            `http://localhost:${process.env.CLIENT_PORT_1}`,
            `http://localhost:${process.env.CLIENT_PORT_2}`,
            `http://localhost:${process.env.CLIENT_PORT_3}`,
        ],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        credentials: true,
    }),
);

//routes middlewares
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', userFollowProductRoutes);
app.use('/api', categoryRoutes);
app.use('/api', productRoutes);
app.use('/api', cartRoutes);
app.use('/api', deliveryRoutes);
app.use('/api', orderRoutes);
app.use('/api', transactionRoutes);
app.use('/api', reviewRoutes);
app.use('/api', producerRoutes);

//port
const port = process.env.PORT || 8000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
 