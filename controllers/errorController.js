const AppError = require('../Utils/appError');

const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
    const message = `Duplicate field value: ${err.keyValue.name}. Please use another value `;
    return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    const message = `Invalid input data. ${errors}`;
    return new AppError(message, 400);
};

const handleJsonWebTokenError = () =>
    new AppError('Invalid token. Please log in again!', 401);

const handleTokenExpiredError = () =>
    new AppError('Your token has expired! Please log in again.', 401);

const sendErrorDev = (err, req, res) => {
    // originalUrl is the entire URL without host

    // API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
        });
    }

    console.log('ERROR- 😀🤣', err);
    // RENDERED WEBSITE
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: err.message,
    });
};
const sendErrorProd = (err, req, res) => {
    // API
    if (req.originalUrl.startsWith('/api')) {
        // Operational,trusted error:send message to client.
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                err,
                status: err.status,
                message: err.message,
            });

            // Programming or other unknow error: don`t leak error details
        }
        // 1) Log error
        console.log('ERROR- 😀🤣', err);

        // 2) send generic message
        return res.status(500).json({
            err,
            status: 'error',
            message: 'Something went very wrong!',
        });
    }
    console.log('ERROR- 😀🤣', err);
    // RENDERED WEBSITE
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Something went wrong-O!',
            msg: err.message,
        });
    }
    // 1) Log error

    // 2) send generic message
    // Programming or other unknow error: don`t leak error details
    return res.status(err.statusCode).render('error', {
        title: 'Something went wrong!',
        msg: 'Please try again later',
    });
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);

    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res);
    } else if (process.env.NODE_ENV === 'production') {
        let error = { ...err };
        // error.message = err.massage;
        console.log(1, error.name, 2, error.code, 3, err.name);
        if (err.name === 'CastError') err = handleCastErrorDB(err);
        if (err.code === 11000) err = handleDuplicateFieldsDB(err);
        if (err.name === 'ValidationError') err = handleValidationErrorDB(err);
        if (err.name === 'JsonWebTokenError') err = handleJsonWebTokenError();
        if (err.name === 'TokenExpiredError') err = handleTokenExpiredError();

        sendErrorProd(err, req, res);
    }
};
