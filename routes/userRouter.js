const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

router
    .post('/signup', authController.signup)
    .post('/login', authController.login)

router.use(authController.protect)
    .get('/searchUser', userController.searchUser)
    .get('/myProfile', authController.getProfile)
    .patch('/updateProfile', userController.uploadUserImage, userController.resizeImage, authController.updateProfile);

module.exports = router;