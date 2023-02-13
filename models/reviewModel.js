const mongoose = require("mongoose");
const Tour = require("./tourModel");

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
        tour: {
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

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });


reviewSchema.pre(/^find/, function (next) {
    // this.populate({
    //     path: "tour",
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

// the reason that we use static methods is because we want to call aggregate which is available in only model, not document.
reviewSchema.statics.calcAverageRating = async function (tourId) {
    // 'this' is pointing to the current model
    const stats = await this.aggregate([
        {
            $match: { tour: tourId },
        },
        {
            $group: {
                _id: "$tour", // tour field on the reviewSchema
                nRating: { $sum: 1 },
                avgRating: { $avg: "$rating" }, // rating field on the reviewSchema
            },
        },
    ]);

    console.log("stats", stats); // stats is Array [{_id, nRating, avgRating}]
    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5, // set default average rating
        });
    }
};

reviewSchema.post("save", async function () {
    // 'this' points to the current document review
    // 'this.constructor' points to the Model who created that document
    this.constructor.calcAverageRating(this.tour);

    // Review.calcAverageRating(this.tour); // this line won't work because Review not defined yet. so using constructor
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.post(/^findOneAnd/, async function (doc, next) {
    // get the document in Query middleware
    const reviewDoc = await this.model.findOne(this.getQuery());
    // console.log('this.reviewDoc', this.reviewDoc);
    console.log('this.getQuery()', this.getQuery());
    console.log("doc", doc);

    // execute static function in Query middleware
    await this.model.calcAverageRating(reviewDoc.tour); // way1 to call static method
    // await reviewDoc.constructor.calcAverageRating(reviewDoc.tour); // way2 to call static method
    // await Review.calcAverageRating(reviewDoc.tour); // way3 to call static method
    await Review.calcAverageRating(doc.tour);
    next();
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
