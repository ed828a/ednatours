// const fs = require("fs");
const Tour = require("../models/tourModel");

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
    req.query.limit = 5
    req.query.sort = '-ratingsAverage,price'
    req.query.fields = 'name, price, ratingsAverage, summary, difficulty'

    next()
}



// the query with filtering, sorting, limiting, pagination
exports.getAllTours = async (req, res) => {
    console.log("req.query", req.query);
    console.log("req.params", req.params);

    try {
        // 1) Filtering
        const queryObj = { ...req.query };
        const excludedFields = ["page", "sort", "limit", "field"];
        excludedFields.forEach((el) => delete queryObj[el]); // remove those properties from queryObj

        // 2) Advanced Filtering
        const queryString = JSON.stringify(queryObj);
        const newQueryString = queryString.replace(
            /\b(gte|gt|lt|lte)\b/g,
            (match) => `$${match}`
        );
        // \b(AWORD)\b means only match AWORD as a word, not part of word
        const newQueryObj = JSON.parse(newQueryString);
        console.log("newQueryObj", newQueryObj);

        // build QUERY instance: query
        let query = Tour.find(newQueryObj); // this return a Query object
        // it's same as above, but using mongo methods
        // const query = Tour.find()
        //     .where("duration")
        //     .equals(5)
        //     .where("difficulty")
        //     .equals("easy");

        // 3) Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(",").join(" ");
            console.log('sortBy: ', sortBy)
            query = query.sort(sortBy);
            // If a string is passed, it must be a space delimited list of path names.
            // The sort order of each path is ascending unless the path name is prefixed with - which will be treated as descending.
        } else {
            query = query.sort('-createdAt');
        }

        // 4) fields limiting
        if(req.query.fields){
            const fields = req.query.fields.split(',').join(' ')
            query = query.select(fields) // query.select('name duration price') select only those fields in array to query
        } else {
            query = query.select('-__v -createdIAddedAt') // - means excluding
        }

        // 5) Pagination
        const page = req.query.page * 1 || 1  // a trick to convert to Number
        const limit = req.query.limit * 1 || 100; // limit items per page
        const skip = (page -1) * limit
        // page=2&limit=10 1-10 page 1, 11-20 page 2, ...
        query = query.skip(skip).limit(limit)

        if(req.query.page) {
            const numTours = await Tour.countDocuments(); // return the total number of documents
            if(skip >= numTours) {
                throw new Error("this page doesn't exist.")
            }
        }
        
        // execute QUERY
        const tours = await query;
        // console.log("tours", tours);

        // send response
        res.status(200).json({
            status: "success",
            results: tours.length,
            data: { tours },
        });
    } catch (error) {
        console.log('error', error)
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
