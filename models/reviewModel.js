const mongoose = require('mongoose');
const Tour = require('./tourModel');

// review / rating /createdAt / ref to tour /ref to user

const reviewSchema = new mongoose.Schema(
    {
        review: {
            required: [true, 'please make a comment.'],
            type: String,
            maxlength: [
                1500,
                'A review must have less or equal then 1500 characters',
            ],
            minlength: [1, 'A rivew must have more or equal then 1 characters'],
        },
        rating: {
            required: [true, 'a comment must along with a rating.'],
            type: Number,
            max: [5, 'Rating must be below 5'],
            min: [1, 'Rating must be above 0'],
        },
        createAt: {
            type: Date,
            default: Date.now(),
            select: false,
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.'],
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user.'],
        },
    },
    {
        // when we have a virtual property basically a field that is not stored in the database but calculated using some other value.
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

// in order to ensure that one user cannot write multiple reviews for the same tour.
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user',
        select: 'name photo',
    });
    // this.populate({
    //     path: 'tour',
    //     select: 'name',
    // });
    next();
});

// we created this function as a static method, because we needed to call the aggregate function
reviewSchema.statics.calcAverageRatings = async function (tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' },
            },
        },
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
    console.log(stats);
};

// post middleware does not get access to next.
reviewSchema.post('save', function (next) {
    // this points to current
    // constructor points to current Model
    this.constructor.calcAverageRatings(this.tour);
});

// /^findOneAnd/ can Search findByIdAndUpdate and findByIdAndUpdate
// tip: If 'pre' is change to 'post', 'this' will no longer points to query.
reviewSchema.pre(/^findOneAnd/, async function (next) {
    // this points to query

    // Get the review document and store it in this.r.
    this.r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function (next) {
    // await this.findOne(); does NOT work here, query has already executed.
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
