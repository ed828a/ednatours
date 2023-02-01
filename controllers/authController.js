const { promisify } = require('util');
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");
const jwt = require("jsonwebtoken");

const signToken = (id) => {
    // usually JWT_SECRET is 32 characters long
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

exports.signup = catchAsyncError(async (req, res, next) => {
    // we noly use take the neccesary data from req.body
    // only admin controls the user's role manually.
    const newUser = await User.create(req.body)
    // const newUser = await User.create({
    //     name: req.body.name,
    //     email: req.body.email,
    //     password: req.body.password,
    //     passwordConfirm: req.body.passwordConfirm,
    // });

    // when you sign up, you also log in. which means just sending the token back.
    const token = signToken(newUser._id); // using _id as payload is common practice

    res.status(201).json({
        status: "success",
        token,
        data: {
            user: newUser,
        },
    });
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    // 1) check if email and password exist
    if (!email || !password) {
        return next(new AppError("please provide email and password", 400));
    }

    // 2) check if user exists and password is correct
    const user = await User.findOne({ email: email }).select("+password"); // get password field
    if (!user) {
        return next(
            new AppError(
                `invalid credentials${
                    process.env.NODE_ENV === "development" ? "(email)" : ""
                }`,
                401
            )
        );
    }

    const isCorrect = await user.correctPassword(password, user.password);
    if (!isCorrect) {
        return next(
            new AppError(
                `invalid credentials${
                    process.env.NODE_ENV === "development" ? "(password)" : ""
                }`,
                401
            )
        );
    }

    // 3) if everything ok, send token to client
    const token = signToken(user._id);

    res.status(200).json({
        status: "Success",
        token,
    });
});

exports.protect = catchAsyncError(async (req, res, next) => {
    // 1) get token & check if it exists
    let token
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1]
    }
    if(!token){
        return next(new AppError("You are not logged in. Please log in to get access", 401))
    }

    // 2) verification token
    // convert a callback function to a promise    
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
    console.log('decoded: ', decoded)
    
    // 3) check if user still exists, prevent the case user was erased after token issued.
    const currentUser = await User.findById(decoded.id)
    if(!currentUser){
        return next(new AppError("User owning this token not exist", 401))
    }

    // 4) check if user changed password after the token was issued
    if(currentUser.changePasswordAfter(decoded.iat)){
        return next(new AppError("User recently changed password, please log in again", 401))
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
}); 
