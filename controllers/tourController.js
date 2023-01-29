// const fs = require("fs");
const Tour = require("../models/tourModel");
const APIFeatures = require("../utils/apiFeatures");

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
        console.log(error.message);
        res.status(400).json({ status: "failure", message: error });
    }
};

exports.getTour = async (req, res) => {
    console.log("req.query", req.query);
    console.log("req.params", req.params);
    try {
        console.log(req.params);

        const tour = await Tour.findById(req.params.id); // this is the shorthand of Tour.findOne({_id: req.param.id})

        res.status(200).json({
            status: "success",
            data: { tour },
        });
    } catch (error) {
        res.status(404).json({ status: "failure", message: "No Such Tour" });
    }
};

exports.updateTour = async (req, res) => {
    try {
        console.log(req.params);
        console.log(req.body);

        const newTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }); // options new makesure the updated item is returned.
        res.status(200).json({
            status: "success",
            data: { tour: newTour },
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "failure",
            message: error,
        });
    }
};

exports.deleteTour = async (req, res) => {
    try {
        console.log(req.params);

        const tour = await Tour.findByIdAndDelete(req.params.id);
        // console.log(tour)
        if (!tour) {
            throw new Error("No sucn Tour!!!"); // the text argument will appear in error.message
        }
        res.status(204).json({
            // 204 don't send any body to response
            status: "success",
            data: { tour },
        });
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
