// const catchAsync = require('../Utils/catchAsync');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const Booking = require('../models/bookingModel');
const Review = require('../models/reviewModel');
const factory = require('./handlerFactory');

exports.isBooked = catchAsync(async (req, res, next) => {
    // 检查booking中的用户id是否与当前用户相同
    const booking = await Booking.find({
        user: req.user.id,
        tour: req.query.tourId,
    });
    // console.log(Boolean(booking));
    if (booking.length > 0) {
        next();
    } else {
        return next(new AppError('Can only review subscribed tours!', 400));
    }
});

exports.setTourUserIds = (req, res, next) => {
    //console.log(req);
    if (!req.body.tour) req.body.tour = req.query.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
};

exports.getAllReview = factory.getAll(Review);
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
