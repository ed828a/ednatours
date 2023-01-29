const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "error message: a tour must have a name"],
            unique: true,
            trim: true,
        },
        duration: {
            type: Number,
            required: [true, "A tour must have a duration"],
        },
        maxGroupSize: {
            type: Number,
            required: [true, "A tour must have a group size"],
        },
        difficulty: {
            type: String,
            required: [true, "Must have a difficulty "],
        },
        ratingsAverage: { type: Number, default: 4.5 },
        ratingsQuantity: { type: Number, default: 0 },
        price: {
            type: Number,
            required: true,
        },
        priceDiscount: Number,
        summary: {
            type: String,
            trim: true,
            required: [true, "Must have a summary"],
        },
        description: { type: String, trim: true },
        imageCover: {
            type: String,
            required: [true, "Must have a cover image"],
        },
        images: Array(String),
        startDates: Array(Date),
        createdIAddedAt: {
            type: Date,
            default: Date.now()
        },
        updatedAt: {
            type: Date,
            select: false  // don't select this field when querying
        }
    },
    { timestamps: true }
);

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
