const express = require("express");
const morgan = require("morgan");
const tourRouter = require("./routes/tourRoutes");
const userRouter = require("./routes/userRoutes");

const app = express();

app.use(express.static(`${__dirname}/public`)); // this seems to point public fold as a root to the clients

app.use(express.json());
if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
}

// mounting routers
app.use("/api/v1/tours", tourRouter);
app.use("/api/v1/users", userRouter);

module.exports = app;
