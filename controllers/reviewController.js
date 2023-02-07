const Review = require("../models/reviewModel");
const catchAsyncError = require("../utils/catchAsyncError");

exports.getAllReviews = catchAsyncError(async (req, res, next) => {
    const reviews = await Review.find();
    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: { reviews },
    });
});

exports.createReview = catchAsyncError(async (req, res, next) => {
    const { review, rating, tour, user } = req.body; 

    const newReview = new Review({
        review,
        rating,
        user,
        tour,
    });
    
    await newReview.save();

    res.status(201).json({
        status: "success",
        data: newReview,
    });
});

// exports.createReview = catchAsyncError(async (req, res, next) => {
//     const { review, rating } = req.body;
//     const userId = req.user.id;
//     const tourId = req.params.id;

//     const newReview = new Review({
//         review,
//         rating,
//         user: userId,
//         tour: tourId,
//     });
//     await newReview.save();

//     res.status(201).json({
//         status: "success",
//         data: newReview,
//     });
// });

exports.getReviews = catchAsyncError(async (req, res, next) => {
    const tourId = req.params.id;

    const reviews = await Review.find({ tour: tourId });

    res.status(200).json({
        status: "success",
        data: { reviews },
    });
});

exports.getReview = catchAsyncError(async (req, res, next) => {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
        return next(new AppError("Review not found", 404));
    }

    res.status(200).json({
        status: "success",
        data: { review },
    });
});
