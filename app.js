const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require('./controllers/errorController')

const app = express();

app.use(express.static(`${__dirname}/public`)); // this seems to point public fold as a root to the clients

app.use(express.json());
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString()
    next()
})

// mounting routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

// app.all() matches all HTTP verbs.
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404))
}) 

app.use(globalErrorHandler)

module.exports = app;
