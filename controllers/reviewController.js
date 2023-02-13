const Review = require("../models/reviewModel");
const catchAsyncError = require("../utils/catchAsyncError");
const factory = require("../controllers/handlerFactory")

// exports.getAllReviews = catchAsyncError(async (req, res, next) => {
//     let filter = {};

//     if(req.params.tourId) {
//         filter = {tour: req.params.tourId};
//     }
//     console.log('filter', filter);

//     const reviews = await Review.find(filter);
//     res.status(200).json({
//         status: "success",
//         results: reviews.length,
//         data: { reviews },
//     });
// });
exports.getAllReviews = factory.getAll(Review);

// exports.createReview = catchAsyncError(async (req, res, next) => {
//     const { review, rating, tour, user } = req.body; 

//     const newReview = new Review({
//         review,
//         rating,
//         user,
//         tour,
//     });
    
//     await newReview.save();

//     res.status(201).json({
//         status: "success",
//         data: newReview,
//     });
// });
exports.setTourUserIds = (req, res, next) => {
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;
    next()
}
// exports.createReview = catchAsyncError(async (req, res, next) => {    
//     const { review, rating } = req.body;
//     const userId = req.user.id;
//     const tourId = req.params.tourId;
//     console.log('userId', userId)
//     console.log('tourId', tourId)

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
exports.createReview = factory.createOne(Review);

exports.getReviews = catchAsyncError(async (req, res, next) => {
    const tourId = req.params.tourId;

    const reviews = await Review.find({ tour: tourId });

    res.status(200).json({
        status: "success",
        results: reviews.length,
        data: { reviews },
    });
});

// exports.getReview = catchAsyncError(async (req, res, next) => {
//     const { id } = req.params;

//     const review = await Review.findById(id);
//     if (!review) {
//         return next(new AppError("Review not found", 404));
//     }

//     res.status(200).json({
//         status: "success",
//         data: { review },
//     });
// });

exports.getReview = factory.getOne(Review);
exports.deleteReview = factory.deleteOne(Review);
exports.updateReview = factory.updateOne(Review);
