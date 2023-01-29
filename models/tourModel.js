const mongoose = require("mongoose");
const slugify = require("slugify");
const validator = require('validator')

const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "error message: a tour must have a name"],
            unique: true,
            trim: true,
            maxLength: [40, "A tour name must not exceed 40 characters"],
            minLength: [10, "A tour name must have more than 10 characters"],
            validate: [validator.isAlpha, "Tour name contains only characters."]
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
            enum: {
                values: ["easy", "medium", "difficult"],
                message: "Difficulty is either: easy, medium, difficult",
            },
        },
        ratingsAverage: {
            type: Number,
            default: 4.5,
            min: [1, "Rating must be greater than 0"],
            max: [10, "Rating can't be bigger than 10"],
        },
        ratingsQuantity: { type: Number, default: 0 },
        price: {
            type: Number,
            required: true,
        },
        priceDiscount: {
            type: Number,
            validate: {
                validator: function (val) { // this function can not work on update, only work on create
                    return val < this.price;
                },
                message: "Discount price ({VALUE}) should be below regular price",
            },
        },
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
            default: Date.now(),
        },
        updatedAt: {
            type: Date,
            select: false, // don't select this field when querying
        },
        slug: String,
        secretTour: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true }, // make sure virtual properties presenting
        toObject: { virtuals: true },
    }
);

// virtual property is created each time when we get some data out of the database.
tourSchema.virtual("durationWeeks").get(function () {
    // we need this in this function, this is pointing to the current document
    return this.duration / 7;
});

// DOCUMENT middleware: run before .save() and .create(), but not .insertMany()
tourSchema.pre("save", function (next) {
    const tour = this; // because this is pointing the current document, it's called document middleware.
    this.slug = slugify(this.name, { lower: true }); // Don't forget to add slug field in tourSchema

    next(); // because it's a middleware
});

// tourSchema.pre('save', function (next) {
//     console.log('Will save document....')
//     next()
// })
// tourSchema.post('save', function (doc, next) {
//     console.log(doc)  // doc is the saved document
//     next()
// })

// QUERY middleware, events decide the middleware type.
// this regex suits all find-methods
tourSchema.pre(/^find/, function (next) {
    this.start = Date.now();
    // this is pointing to the current query, not a document
    this.find({ secretTour: { $ne: true } });

    next();
});

tourSchema.post(/^find/, function (docs, next) {
    // console.log(docs);
    console.log(`${Date.now() - this.start} ms!!!`);
    next();
});

// AGGREGATION middleware
tourSchema.pre("aggregate", function (next) {
    // this is pointing Aggregation Object
    this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
    next();
});

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
