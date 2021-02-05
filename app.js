const rateLimit = require('express-rate-limit');
const morgan = require ('morgan'); 
const express = require ('express');
const helmet =  require ('helmet');
const mongoSanitize =  require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require ('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require ('./routes/tourRoutes');
const userRouter = require ('./routes/userRoutes');
const errorController = require('./controllers/errorController');
const { mongo } = require('mongoose');

const app = express();


//Global middlewares
//Set Security HTTP Headers
app.use(helmet());


// Development logging
if(process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
};

// Limit requests from same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);

// Body parser, reading data from the body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Preventing parameter pollution 
app.use(hpp
    ({
    nodewhitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupsize', 'difficulty', 'price']
}));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test Middleware
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    //console.log(req.headers);
    next();
});

//Routes...
//this is where we mount...
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;