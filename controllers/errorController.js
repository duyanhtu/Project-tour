const AppError = require('./../utils/appError');
const handCastErrorDB = err => {
  const message = `Invaild ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldsDB = err => {
    const value = err.keyValue.name
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};
const handleValidationErrorDB = err =>{
  // Objetc.values: sẽ trả về một mảng các phần tử có trong object đó
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('/ ')}`;
  return new AppError(message, 400);
};
const sendErrorDev =(err, res)=>{
  res.status(err.statusCode).json({
    status: err.status, 
    error: err,
    message: err.message,
    stack: err.stack
  });
};
const handleJWTError = () =>{
  return new AppError('Invald token.Please log in again!', 401);
};
const handleTokenExpiredError = () =>{
  return new AppError('Your tokeb has expired! Please log in again!',401);
};
const sendErrorProd =(err, res)=>{
  //Operational, trusted error: send message to client
  if(err.isOperational){
    res.status(err.statusCode).json({
      status: err.status, 
      message: err.message
    });
  // Progarming or other unknown error: don't leak error details
  }else{
  //1) Log error 
    console.error('ERROR', err);

  //2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong'
    })
  }
};
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if(process.env.NODE_ENV === 'development'){
      sendErrorDev(err, res);
    } else if(process.env.NODE_ENV === 'production'){
    
      if(err.name ===  'CastError') err = handCastErrorDB(err);
      if(err.code === 11000) err = handleDuplicateFieldsDB(err);
      if(err.name === 'ValidationError') err = handleValidationErrorDB(err);
      if(err.name === 'JsonWebTokenError') err = handleJWTError();
      if(err.name === 'TokenExpiredError') err = handleTokenExpiredError();
      sendErrorProd(err, res);
    }
};