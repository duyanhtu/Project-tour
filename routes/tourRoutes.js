const express = require('express');
const router = express.Router();
const reviewRoutes= require('./../routes/reviewRoutes');
const tourController =require('./../controllers/tourController');
const authController = require('./../controllers/authController');

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
        .route('/tours-within/:distance/center/:latlng/unit/:unit')
        .get(tourController.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
        
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