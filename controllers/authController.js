const { promisify } = require("util");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");


const signToken = (id) => {
    // usually JWT_SECRET is 32 characters long
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createdSendToken = (user, statusCode, res) => {
    const token = signToken(user._id); // this should in userModel.js
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true, // make sure this cookie can not be accessed by browser    
    }
    if(process.env.NODE_ENV === "production"){
        cookieOptions.secure = true; // only for https
    }

    // remove password from response
    user.password = undefined;

    res.cookie('jwt', token, cookieOptions)

     res.status(statusCode).json({
         status: "success",
         token,
         data: {
             user,
         },
     })
}

exports.signup = catchAsyncError(async (req, res, next) => {
    // we noly use take the neccesary data from req.body
    // only admin controls the user's role manually.

    // const newUser = await User.create(req.body); // req.body is opptunity to inject hacking code
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    });

    // when you sign up, you also log in. which means just sending the token back.
    // const token = signToken(newUser._id); // using _id as payload is common practice

    // res.status(201).json({
    //     status: "success",
    //     token,
    //     data: {
    //         user: newUser,
    //     },
    // });

    createdSendToken(newUser, 201, res);
    
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;
    console.log('req.body:', req.body);
    
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
    // const token = signToken(user._id);

    // res.status(200).json({
    //     status: "Success",
    //     token,
    // });
    createdSendToken(user, 200, res);
    
});

exports.protect = catchAsyncError(async (req, res, next) => {
    // 1) get token & check if it exists
    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
        return next(
            new AppError(
                "You are not logged in. Please log in to get access",
                401
            )
        );
    }

    // 2) verification token
    // convert a callback function to a promise
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log("decoded: ", decoded);

    // 3) check if user still exists, prevent the case user was erased after token issued.
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
        return next(new AppError("User owning this token not exist", 401));
    }

    // 4) check if user changed password after the token was issued
    if (currentUser.changePasswordAfter(decoded.iat)) {
        return next(
            new AppError(
                "User recently changed password, please log in again",
                401
            )
        );
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
});

// restrict certain roles to access to resources
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    "You do not have permission to perform this action",
                    403
                )
            );
        }
        next();
    };
};

// reset token is just a random token, not JWT token.
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
    // 1) get user by email
    const user = await User.findOne({ email: req.body.email }); // user email must be unique
    if (!user) {
        return next(new AppError("There is no User with that email", 404));
    }

    // 2) generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) send reset token to user
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and password comfirm to: ${resetUrl}\nIf you didn't forget your password, please ignore this email`;
    try {
        await sendEmail({
            to: user.email,
            subject: "Password Reset Token (valid for 10 minutes)",
            message,
        });
    } catch (error) {
        console.log('error', error);

        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError("There was an error sending the email. Try again later!", 500)
        );
    }

    res.status(200).json({
        status: "success",
        messge: "Token sent to email!",
    });
});

exports.resetPassword = catchAsyncError(async (req, res, next) => {
     // 1) get user based on reset token
     const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token) 
      .digest("hex");
     const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() },
     })
     // 2) if token has not expired, and there is user, set the new password
     if (!user) {
        return next(new AppError("Token is invalid or has expired", 400));
     }
     user.password = req.body.password;
     user.passwordConfirm = req.body.passwordConfirm; 
     user.passwordResetToken = undefined;
     user.passwordResetExpires = undefined;
     await user.save();
     // 3) update changedPasswordAt property for the user
     // 4) log the user in, send JWT token to user
    //  const token = signToken(user._id); // this should in userModel.js

    //  res.status(200).json({
    //      status: "success",
    //      token,
    //  })
     createdSendToken(user, 200, res);
     
});

exports.updatePassword = catchAsyncError(async (req, res, next) => {
    // 1) get user from collection
    const user = await User.findById(req.user.id).select("+password");

    // 2)check if POSTed current password is correct
    const currentPassword = req.body.currentPassword;
    const isCorrectPassword = await user.correctPassword(currentPassword, user.password);
    if(!isCorrectPassword) {
        return next(new AppError("Current password is incorrect", 401));
    }

    // 3) if so update password    
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
       
    // 4) log the user in, send JWT token to user
    const token = signToken(user._id); // this should in userModel.js

    res.status(200).json({
         status: "success",
         token,
     })
     createdSendToken(user, 200, res);

})

// homework: if user keep failing to log in 10times, then he must wait 10 hours before trying again


