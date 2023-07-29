const multer = require('multer');
const Tour = require('../models/tourModel');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const factory = require('./handlerFactory');
const sharp = require('sharp');

// const tours = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// 接下来使用mongodb，不再需要检查id
// exports.checkID = (req, res, next, val) => {
//     console.log(`Tour id is: ${val}`);
//     if (req.params.id * 1 > tours.length) {
//         return res.status(404).json({
//             status: 'fail',
//             message: 'Invalid ID',
//         });
//     }
//     next();
// };

// 接下来使用mongodb，不再需要检查id
// exports.checkNameAndPrice = (req, res, next) => {
//     console.log(`hey! ${req.body.name}`);
//     if (!req.body.name || !req.body.price) {
//         return res.status(400).json({
//             status: 'fail',
//             message: 'Missing name or price',
//         });
//     }
//     next();
// };

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(
            new AppError('Not an image! Please upload only images.', 400),
            false
        );
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
});

exports.uploadTourImages = upload.fields([
    {
        name: 'imageCover',
        maxCount: 1,
    },
    {
        name: 'images',
        maxCount: 3,
    },
]);

// upload.array('filed',5) // req.files // if only had one field which accepts multiple images or multiple files at the same time.

exports.resizeTourimages = catchAsync(async (req, res, next) => {
    // console.log(req.files);

    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image

    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];
    await Promise.all(
        // the promise.all() method is used to wait for all of the promises returned by the map() method to resolve before continuing with the next step in the code.
        req.files.images.map(async (file, i) => {
            const filename = `tour-${req.params.id}-${Date.now()}-${i}.jpeg`;

            await sharp(file.buffer)
                .resize(2000, 1333)
                .toFormat('jpeg')
                .jpeg({ quality: 90 })
                .toFile(`public/img/tours/${filename}`);

            req.body.images.push(filename);
        })
    );

    //console.log(req.body);

    next();
});

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,ratingsAverage,summary,difficulty,price';
    next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.updateTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);
// exports.deleteTour = catchAsync(async (req, res, next) => {
//     // await Tour.deleteOne({ _id: req.params.id });
//     const tour = await Tour.findByIdAndDelete(req.params.id);

//     if (!tour) {
//         return next(new AppError('no tour found with that id', 404));
//     }

//     res.status(204).json({
//         status: 'success',
//     });
// });

exports.getTourStats = catchAsync(async (req, res, next) => {
    // In aggregation we can manipulate the data in a couple of different steps.
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } },
        },
        {
            $group: {
                _id: { $toUpper: '$difficulty' }, // Grouping based on this.
                numTours: { $sum: 1 }, // the sum of the documents searched
                numRatings: { $sum: '$ratingsQuantity' },
                avgrating: { $avg: '$ratingsAverage' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' },
            },
        },
        {
            $sort: { avgPrice: 1 }, // 1 for ascending
        },
        // {
        //     // just for show
        //     $match: { _id: { $ne: 'EASY' } },// $ne:not equal
        // },
    ]);
    res.status(200).json({
        status: 'success',
        data: {
            stats,
        },
    });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates',
        },
        {
            $match: {
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`),
                },
            },
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' },
            },
        },
        {
            $addFields: { month: '$_id' },
        },
        {
            $project: {
                _id: 0, // hide the _id field.
            },
        },
        {
            $sort: { numTourStarts: -1 }, // 1 for ascending,-1 for desending.
        },
        {
            $limit: 6,
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan,
        },
    });
});

// '/tours-within/:distance/center/:latlng/unit/:unit'
// /tours-within/233/center/22.837988, 108.335735/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // When unit is kilometer use distance / 6378.1, miles use distance / 3963.2.

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the for format lat,lng.',
                400
            )
        );
    }

    // $geoWithin will finds documents within a certain geometry
    const tours = await Tour.find({
        startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: { data: tours },
    });
});

exports.getDistances = catchAsync(async (req, res, next) => {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multipler = unit === 'mi' ? 0.00062137 : 0.001;

    if (!lat || !lng) {
        next(
            new AppError(
                'Please provide latitutr and longitude in the for format lat,lng.',
                400
            )
        );
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    // near is the point from which to calculate the distances, all the distances will be calculated from this point.
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1],
                },
                distanceField: 'distance', //where all the calculated distances will be stored.
                distanceMultiplier: multipler,
            },
        },
        {
            $project: {
                // which fields can display.
                distance: 1,
                name: 1,
            },
        },
    ]);

    res.status(200).json({
        status: 'success',
        data: { data: distances },
    });
});
