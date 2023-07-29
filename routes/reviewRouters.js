const express = require('express');
const {
    createReview,
    getAllReview,
    deleteReview,
    updateReview,
    setTourUserIds,
    getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// set {mergeParams:true} is because, by default, each router only have access to the parameters of their specific routes.
// POST /tour/234fad4/reviews
// when we set set {mergeParams:true} we can access the parameters like '234fad4'
const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route('/')
    .post(restrictTo('user'), setTourUserIds, createReview)
    .get(getAllReview);

router
    .route('/:id')
    .delete(restrictTo('admin', 'user'), deleteReview)
    .patch(restrictTo('admin', 'user'), updateReview)
    .get(getReview);

module.exports = router;
