const User = require('../models/userModel');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const filterObj = (obj, ...allowedFields)=>{
    const newObj ={};
    // Lấy toàn bộ key trong object
    Object.keys(obj).forEach(el =>{
        if(allowedFields.includes(el)){
            newObj[el] = obj[el];
        }
    });
    return newObj;
};
//Update me chỉ có thể cho cập nhật tên hoặc email
exports.getMe = (req, res, next)=>{
    req.params.id = req.user.id;
    next();
};
exports.updateMe =catchAsync(async  (req, res, next) =>{
    if(req.body.password || req.body.passwordConfirm){
        return next(new AppError('This route is not for password update! Please use /updateMyPassword.'), 400);   
    };
    const filteredBody = filterObj(req.body,'name', 'email');
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {new: true, runValidators: true});
    
    res.status(200).json({
        status: "success",
        data: user
    });
});
exports.deleteMe =catchAsync(async (req, res, next) =>{
    await User.findByIdAndUpdate(req.user.id, {active : false});
    res.status(204).json({
        status: "success",
        data: null
    })
});
exports.createUser = (req, res) =>{
    res.status(500).json({
        status: "error",
        message: 'This route is not yet defined! Please use /signup instead'
    });
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);
// Do not update password with this!
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);