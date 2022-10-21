const { match } = require('assert');
const fs = require('fs');
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory')
const AppError = require('./../utils/appError');
const APIfeatures = require('./../utils/apiFeatures');
const catchAsync = require('./../utils/catchAsync');
exports.aliasTopTours = (req, res, next) =>{
    req.query.limit = 5;
    req.query.sort='-ratingAverage,price';
    req.query.fields='name,price,ratingAverage,summary,difficulty';
    next();
};


exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: {$gte: 4.5} }
        },
        {
            $group: { 
                _id: { $toUpper: '$difficulty'},
                numTours: { $sum: 1},
                numRating: { $sum: '$ratingsQuantity'},
                avgRating: { $avg: '$ratingsAverage'}, 
                avgPrice: { $avg: '$price'},
                minPrice: { $min: '$price'},
                maxPrice: { $max: '$price'},
            }
        },
        {
            $sort: { 
                // Sắp xếp tăng: 1
                // Sắp xếp giảm: -1
                avgPrice: 1
                }
            },
            // {
                //     // $ne: sẽ loại bỏ những thành phần của EASY đi 
                //     $match: {_id: { $ne: 'EASY'} }
                // }
            ]);
            res.status(200).json({
                status: "success",
                data:{stats} 
            });
        });
        exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
            const year = req.params.year * 1;
            const plan = await Tour.aggregate([
                {
                    $unwind : '$startDates'
                },
                {
                    $match: {
                        startDates: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)   
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$startDates'},
                        numTourStarts: {$sum: 1},
                        //push sẽ trả về mảng
                        tours: {$push: '$name'}
                }
            },
            {
                $addFields: { month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: {numTourStarts: -1}
            }
            
        ]);
        res.status(200).json({
            status: "success",
            data:{plan} 
        });
    });
exports.getAllTours = factory.getAll(Tour);
    
exports.getTour = factory.getOne(Tour, {path: 'reviews'});
    // const id = req.params.id * 1;// cách biến chuỗi thành 1 số
    // find(): sẽ trả về một mảng các ptu thỏa mãn điều kiện
    // cách để tham chiếu DB const tour = await Tour.findById(req.params.id).populate({ path: 'guides', select: '-__v -passwordChangedAt'})
    // Có thể thay để viết vào query middleware
exports.createTour = factory.createOne(Tour);
    
exports.updateTour = factory.updateOne(Tour);
    
exports.deleteTour = factory.deleteOne(Tour);