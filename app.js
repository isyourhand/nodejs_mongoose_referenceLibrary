const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const ExpressMongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

const AppError = require('./Utils/appError');
const globalErrorhandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouters');
const userRouter = require('./routes/userRouters');
const reviewRouter = require('./routes/reviewRouters');
const viewRouter = require('./routes/viewRouters');
const bookingRouter = require('./routes/bookingRouters');

// Start express application
const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
// If is './views', will always relative to the directory from where we launched the Note application, and that usually is the root project folder.
app.set('views', path.join(__dirname, 'views'));

// 1) GLOBAL MIDDLEWARES

// Implement CORS
app.use(cors());
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//     origin:'https://www.natours.com'
// }))

app.options('*', cors());
//app.options('api/v1/tours/:id', cors()); // only the tours could be deleted or patched from a cross-origin request,right.

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));
// set Security HTTP headers
app.use(helmet({ contentSecurityPolicy: false }));

//Development logging
console.log(`${process.env.NODE_ENV}`);
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000, //timeWindow
    message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

// middleware,in the middle of the request and the response
// express.json mean actually use middleware, add middleware to our middleware stace
// Body parser, reading data from body into req.body
app.use(
    express.json({
        limit: '10kb', // 只读取10kb以下的body
    })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection.
app.use(ExpressMongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// Serving static files

// only compression the text that is sent to clients, So its not going to be working for images, because image are usually already compressed
app.use(compression());

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    // console.log(req.cookies);
    next(); //we must call next here,otherwise the request/response cycle would really be stuck at this point
});

// 2) ROUTE HANDLERS

// 3) ROUTE

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tours/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);

// 使用中间件，直接指定路线
// mounting a new router on a route
//app.use('/', cors(),viewRouter);
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl} on this server!`, 404)); // if we pass a message whatever it is which will skip all other middlewares in the stack and send it to our global error handling middleware.
});

app.use(globalErrorhandler);

// 4) START SERVER
module.exports = app;
