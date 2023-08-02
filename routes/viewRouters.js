const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);

// submit-user-data
router.post(
    '/submit-user-data',
    authController.protect,
    viewsController.updateUserData
);
router.get('/', authController.isLoggedIn, viewsController.getOverview);

router.use(authController.isLoggedIn);

router.get('/tour/:slug', viewsController.getTour);

// /login
router.get('/login', viewsController.getLoginForm);

module.exports = router;
