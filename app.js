const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();

// set security HTTP headers
app.use(helmet());

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// Limit requests from same API
// prevent Brute Force attacks
const limiter = rateLimit({
    max: 100, // limit each IP to 100 requests per windowMs per hour
    windowMs: 60 * 60 * 1000, // limit each
    message: "Too many requests from this IP, please try again in an hour",
});
app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "10kb" })); // limit request body to 10kb

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());
// what this middleware does: look at the request body, request query string, and request params, and filter out $ and dots.

// Data Sanitization against XSS attacks
app.use(xss()); // prevent inputing malicious html code
app.use(
    hpp({
        whitelist: [
            "duration",
            "ratingsAverage",
            "ratingsQuantity",
            "maxGroupSize",
            "difficulty",
            "price",
        ],
    })
); // HTTP Parameter Pollution Protection

// Serving static files
app.use(express.static(`${__dirname}/public`)); // this seems to point public fold as a root to the clients

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();

    // console.log("req.headers: ", req.headers)

    next();
});

// mounting routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/reviews", reviewRouter);


// app.all() matches all HTTP verbs.
app.all("*", (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
