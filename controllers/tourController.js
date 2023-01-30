// const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

// const toursFromFile = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );
// (async () => {
//     try {
//         const tours = await Tour.find();
//         if (tours.length === 0) {
//             toursFromFile.forEach(async (tour) => {
//                 const newTour = await Tour.create(tour);
//                 if (!newTour) {
//                     throw new Error("creating Tour failed");
//                 }
//             });
//             console.log("Creation done!!");
//         }
//     } catch (error) {
//         console.log(error);
//     }
// })();

// pre-filling query parts to fit the requirement
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = 5;
    req.query.sort = "-ratingsAverage,price";
    req.query.fields = "name, price, ratingsAverage, summary, difficulty";

    next();
};

// the query with filtering, sorting, limiting, pagination
exports.getAllTours = async (req, res) => {
    console.log("req.query", req.query);
    console.log("req.params", req.params);
    try {
        // 5) Pagination
        if (req.query.page) {
            const page = req.query.page * 1 || 1; // a trick to convert to Number
            const limit = req.query.limit * 1 || 100; // limit items per page
            const skip = (page - 1) * limit;
            const numTours = await Tour.countDocuments(); // return the total number of documents
            if (skip >= numTours) {
                throw new Error("this page doesn't exist.");
            }
        }

        // execute QUERY
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;
        // console.log("tours", tours);

        // send response
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: { tours },
        });
    } catch (error) {
        console.log("error", error);
        res.status(400).json({ status: "failure", message: error.message });
    }
};

exports.createTour = async (req, res) => {
    // console.log("createTour - ", req.body)
    try {
        const newTour = await Tour.create(req.body);
        res.status(201).json({
            status: "success",
            data: { tour: newTour },
        });
    } catch (error) {
        console.log('error: ', error)
        // console.log('error.stack: ', error.stack)
        // console.log(error.message);

        if (error.code === 11000) {
            res.status(400).json({
                status: "failure",
                message: `${error.keyValue.name} already exists.`,
            });
        } else {
            res.status(400).json({ status: "failure", message: error });
        }
    }
};

// exports.createTour = catchAsyncError(async (req, res, next) => {
//     const newTour = await Tour.create(req.body);
//     res.status(201).json({
//         status: "success",
//         data: { tour: newTour },
//     });
// });

exports.getTour = async (req, res) => {
    try {
        console.log("req.query", req.query);
        console.log("req.params", req.params);

        const tour = await Tour.findById(req.params.id).select("-__v"); // this is the shorthand of Tour.findOne({_id: req.param.id})

        res.status(200).json({
            status: "success",
            data: { tour },
        });
    } catch (error) {
        console.log('error: ', error)
        if(error.stack.startsWith('CastError')) {
            res.status(400).json({ status: "failure", message: `Invalide ${error.path}: ${error.value}.` });
        } else {
            res.status(404).json({ status: "failure", message: "No Such Tour" });
        }
    }
};

// exports.getTour = catchAsyncError(async (req, res, next) => {
//     console.log("req.query", req.query);
//     console.log("req.params", req.params);
//     const tour = await Tour.findById(req.params.id).select("-__v");
//     if (!tour) {
//         next(new AppError("No tour found with that Id", 404));
//     } else {
//         res.status(200).json({
//             status: "success",
//             data: { tour },
//         });
//     }
// });

exports.updateTour = async (req, res) => {
    try {
        console.log(req.params);
        console.log(req.body);

        const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }); // options new makesure the updated item is returned.
        if (!newTour) {
            next(new AppError("No tour found with that Id", 404));
        } else {
            res.status(200).json({
                status: "success",
                data: { tour: newTour },
            });
        }
    } catch (error) {
        console.log(error);
        if (error.name === "ValidationError") {
            res.status(400).json({
                status: "failure",
                message: error.message,
            });
        } else {
            res.status(500).json({
                status: "failure",
                message: error,
            });
        }
    }
};

// exports.updateTour = catchAsyncError(async (req, res, next) => {
//     const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
//         new: true,
//         runValidators: true,
//     }); // options new makesure the updated item is returned.
//     if (!newTour) {
//         next(new AppError("No tour found with that Id", 404));
//     } else {
//         res.status(200).json({
//             status: "success",
//             data: { tour: newTour },
//         });
//     }
// });

exports.deleteTour = async (req, res) => {
    try {
        console.log(req.params);

        const tour = await Tour.findByIdAndDelete(req.params.id);
        // console.log(tour)
        if (!tour) {
            next(new AppError("No tour found with that Id", 404));
        } else {
            res.status(204).json({
                // 204 don't send any body to response
                status: "success",
                data: { tour },
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: "failure",
            message: error.message,
        });
    }
};

// this middleware is important on the value
exports.checkId = (req, res, next, val) => {
    console.log("val: ", val);
    const tour = tours.find((el) => el.id === req.params.id * 1);
    if (!tour) {
        res.status(404).json({ status: "failure", message: "No Such Tour" });
    } else {
        next();
    }
};

exports.checkBody = (req, res, next) => {
    // middleware to check if body has name and price fields.
    if (req.body.name && req.body.price) {
        next();
    } else {
        return res.status(400).json({ message: "no price or name in body" });
    }
};

// Aggregation
exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 } },
            },
            {
                $group: {
                    _id: { $toUpper: "$difficulty" },
                    numTours: { $sum: 1 },
                    numRatings: { $sum: "$ratingsQuantity" },
                    avgRating: { $avg: "$ratingsAverage" },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                },
            },
            {
                $sort: { avgPrice: 1 },
            },
            // {
            //     $match: {_id: {$ne: 'EASY'}}
            // }
        ]);

        res.status(200).json({
            status: "success",
            data: { stats },
        });
    } catch (error) {
        res.status(400).json({
            status: "failure",
            message: error.message,
        });
    }
};
// Aggregation
exports.getMonthlyPlan = async (req, res, next) => {
    try {
        const year = req.params.year * 1;

        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates",
            },
            {
                $match: {
                    startDates: {
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`),
                    },
                },
            },
            {
                $group: {
                    _id: { $month: "$startDates" },
                    numTourStarts: { $sum: 1 },
                    tours: { $push: "$name" },
                },
            },
            {
                $addFields: { month: "$_id" },
            },
            {
                $project: {
                    _id: 0,
                },
            },
            {
                $sort: { numTourStarts: -1 },
            },
            {
                $limit: 12,
            },
        ]);

        res.status(200).json({
            status: "success",
            results: plan.length,
            data: { plan },
        });
    } catch (error) {
        res.status(400).json({
            status: "failure",
            message: error.message,
        });
    }
};
