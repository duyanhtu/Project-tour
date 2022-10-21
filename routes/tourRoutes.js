const express = require('express');
const router = express.Router();
const reviewRoutes= require('./../routes/reviewRoutes');
// 2. Route Handlers
const tourController =require('./../controllers/tourController');
const authController = require('./../controllers/authController');
// const reviewController = require('./../controllers/reviewController');
// Hàm router.param chạy khi app js gọi đến tourRoutes.js
// router.param('id', tourController.checkID);
router 
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours)
router
    .route('/tour-stats')
    . get(tourController.getTourStats)
router
    .route('/monthly-plan/:year')
    .get(authController.protect
        ,authController.restrictTo('admin', 'lead-guide', 'guide')
        ,tourController.getMonthlyPlan)
router
    .route('/')
    .get(tourController.getAllTours)
    .post(authController.protect
        ,authController.restrictTo('admin', 'lead-guide')
        ,tourController.createTour);
router
    .route('/:id')
    .get(tourController.getTour)
    .patch(authController.protect
        ,authController.restrictTo('admin', 'lead-guide')
        ,tourController.updateTour)
    .delete(authController.protect
        ,authController.restrictTo('admin', 'lead-guide') 
        ,tourController.deleteTour);
// router
//     .route('/:tourId/reviews')
//     .post(authController.protect
//         ,authController.restrictTo('user')
//         ,reviewController.createReview);
router.use('/:tourId/reviews', reviewRoutes);
module.exports = router;