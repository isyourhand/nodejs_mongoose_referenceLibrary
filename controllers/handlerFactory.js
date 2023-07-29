const { Model } = require('mongoose');
const AppError = require('../Utils/appError');
const catchAsync = require('../Utils/catchAsync');
const { populate } = require('../models/reviewModel');
const APIFeatures = require('../Utils/APIFeatures');

// this works because of JavaScript closures, which is a fancy way of saying that inner function here will get access to the variables of the outer function.
exports.deleteOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // await Tour.deleteOne({ _id: req.params.id });
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(new AppError('no document found with that id', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsync(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true, // make sure return the new updated document.
            runValidators: true, // Ensure fields received are as expected.true for run the validatours of schema.
        });

        if (!doc) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(200).json({
            status: 'success',
            data: {
                data: doc, // when the property name has the same name of the value,can write like this.
            },
        });
    });

exports.createOne = (Model) =>
    catchAsync(async (req, res, next) => {
        // const newTour = new Tour({})
        // newTour.save()

        const newDoc = await Model.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                data: newDoc,
            },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsync(async (req, res, next) => {
        // console.log(req.params);

        // // when we multiply a string that looks like a number, when we multiply that with another number,
        // // it will then automatically convert that string to a number.
        // const id = req.params.id * 1;

        let query = Model.findById(req.params.id);
        if (popOptions) query = query.populate(popOptions);
        const doc = await query;
        // Tour.findOne({ _id: req.params.id }) would work the exact same way as above.

        if (!doc) {
            return next(new AppError('No document found with that id', 404));
        }

        res.status(200).json({
            // Jsend格式
            status: 'success',
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });

exports.getAll = (Model) =>
    catchAsync(async (req, res, next) => {
        // BUILD QUERY
        // 1A) Filtering

        // 2) Sorting

        // 3) Field limiting

        // 4) Pagination
        // "|| 1" is set the default value

        // EXECUTE QUERY

        // To allow for nested GET reviews on tour (hack)
        let filter = {};
        if (req.params.tourId) filter = { tour: req.params.tourId };

        console.log(req.query);

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .limitFields()
            .paginate()
            .sort();

        // pre-find middleware here is executed.

        // const doc = await features.query.explain();
        const doc = await features.query; //within the APIFeatures class, the query method is used to obtain the query object that has been processed by the filter(),sort(),limitFields(),and peginate() methods.
        // query.sort().select().skip().limit()

        // SEND QUERY
        res.status(200).json({
            // Jsend格式
            status: 'success',
            requestedAt: req.requestTime,
            results: doc.length,
            data: {
                data: doc,
            },
        });
    });
