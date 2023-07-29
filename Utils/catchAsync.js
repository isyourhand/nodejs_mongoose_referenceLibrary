module.exports = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next); // any occur within fn are passed to the next middleware function.
    };
};

/*
    解读”const catchAsync = (fn) => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};

exports.createTour = catchAsync(async (req, res, next) => {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
        status: 'success',
        data: {
            tour: newTour,
        },
    });
});

*/
