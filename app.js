const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize  = require('express-mongo-sanitize');
const xss = require('xss-clean');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')
const userRoutes = require('./routes/userRoutes');
const tourRoutes = require('./routes/tourRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const  hpp = require('hpp');
const app = express();

// 1) Global Middleware
// Set sercurity HTTP headers
app.use(helmet());
// morgan sẽ trả về một Logger đi kèm mỗi lệnh để dễ kiểm tra lỗi
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Limit from the same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60*60*1000,
  message: "Too many requests from this IP, please try agian in a hour"
});
//  Dùng limiter để giới hạn số lần gửi request đến mọi đường dẫn bắt đầu với '/api'
app.use('/api',limiter);

// Dùng để ngăn chặn các cấu trúc trùng <ap1/v1/tours/sort=duration&sort=price>
app.use(hpp({
  whilelist: [
    'duration',' ratingQuantity', 'ratingAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

app.use(express.json({limit : '10kb'}));
// Sử dụng mongoSanitize để loại bỏ các trường hợp nhập bao gồm $ VD: {$gt: ""}
app.use(mongoSanitize());
// Sử dụng xss để loại bỏ các mã lênh html được  truyền vào mã 
app.use(xss());
app.use(express.static(`${__dirname}/public`));
// cách sửa dụng middleware
// app.use((req, res, next) => {
//   console.log('Hello from the middleware 👋');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(req.headers);
  next();
});
// 3. Route
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next)=>{
  next(new AppError(`Can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
