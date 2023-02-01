const AppError = require("../utils/appError");

const handleCastErrorDB = (err) => {
    const message = `Invalide ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const message = `Duplicate field value: ${err.keyValue.name} Please use another value`
    return new AppError(message, 400)
}

const handleValidatorErrorDB = err => {
    console.log('here 🍍')
    const message = err.message
    return new AppError(message, 400)
}

const handleJWTError = (err) => new AppError("Invalid Token, please login again", 401)
const handleJWTExpired = (err) => new AppError("Expired Token, please login again", 401)

const sendErrorDev = (err, res) => {
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack,
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        });
    } else {
        // programming or other unknown error: don't leak error details

        // 1) log error stack
        // console.error("Error 💥", err);
        // 2) send generic message
        res.status(500).json({
            status: "error",
            message: "Something went wrong!",
        });
    }
};

const errorResponse = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";
    // console.log(`process.env.NODE_ENV = ${process.env.NODE_ENV}`);

    if (process.env.NODE_ENV === "development") {
        sendErrorDev(err, res);
    } else if (process.env.NODE_ENV === "production") {
        let error = { ...err };
        console.log('💥err: ', err)
        console.log('🎈error: ', error) // error is not the complete err
        error.message = err.message;

        if (err.stack.startsWith('CastError')) {
            error = handleCastErrorDB(error);
        }

        if(err.code === 11000){
            error = handleDuplicateFieldsDB(error)
        }

        if(err.name === 'ValidatorError'){
            error = handleValidatorErrorDB(error)
        }

        if(err.name === 'JsonWebTokenError'){
            error = handleJWTError(error)
        }
        if(err.name === 'TokenExpiredError'){
            error = handleJWTExpired(error)
        }

        sendErrorProd(error, res);
    }
};

module.exports = errorResponse;
