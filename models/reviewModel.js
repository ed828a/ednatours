const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "review can not be empty"],
        },
        rating: {
            type: Number,
            required: [true, "rating can not be empty"],
            min: 1,
            max: 5,
        },
        createdAt: {
            type: Date,
            default: Date.now(),
        },
        tourr: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Tour",
            required: [true, "Review must belong to a tour"],
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Review must belong to a author"],
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);



reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: "tourr",
    //     select: "name",
    // }).populate({
    //     path: "user",
    //     select: "name photo",
    // });

    this.populate({
        path: "user",
        select: "name photo",
    });

    next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
