const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const router = express.Router();
//Users
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:resetToken', authController.resetPassword);
router.post('/refreshToken', authController.requestRefreshToken);
router.post('/logout', authController.logout)


router.use(authController.protect);
router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);


router.use(authController.restrictTo('admin'));
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);
router 
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);
module.exports = router;