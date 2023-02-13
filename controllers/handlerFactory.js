const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

exports.deleteOne = (Model) =>
    catchAsyncError(async (req, res, next) => {
        const doc = await Model.findByIdAndDelete(req.params.id);

        if (!doc) {
            return next(
                new AppError(
                    `No document found with the Id ${req.params.id}`,
                    404
                )
            );
        }

        res.status(204).json({
            status: "success",
            data: null,
        });
    });

exports.updateOne = (Model) =>
    catchAsyncError(async (req, res, next) => {
        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }); // options new makesure the updated item is returned.
        if (!doc) {
            next(
                new AppError(
                    `No Document found with that Id ${req.params.id}`,
                    404
                )
            );
        } else {
            res.status(200).json({
                status: "success",
                data: { data: doc },
            });
        }
    });

exports.createOne = (Model) =>
    catchAsyncError(async (req, res, next) => {
        const newDoc = await Model.create(req.body);
        res.status(201).json({
            status: "success",
            data: { data: newDoc },
        });
    });

exports.getOne = (Model, popOptions) =>
    catchAsyncError(async (req, res, next) => {
        let query = Model.findById(req.params.id);
        if (popOptions) {
            query = query.populate(popOptions);
        }
        const doc = await query;
        if (!doc) {
            return next(
                new AppError(
                    `No document found with the Id ${req.params.id}`,
                    404
                )
            );
        }
        res.status(200).json({
            status: "success",
            data: { data: doc },
        });
    });

exports.getAll = (Model) =>
    catchAsyncError(async (req, res, next) => {
        // To allow for nested GET reviews on tour(hack here)
        console.log('req.params', req.params);

        let filter = {}
        if(req.params.tourId) {
            filter = {tour: req.params.tourId};
        }
        console.log('filter', filter);

        const features = new APIFeatures(Model.find(filter), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        // const docs = await features.query.explain(); // for deciding indexing fields
        const docs = await features.query


        // send response
        res.status(200).json({
            status: "success",
            results: docs.length,
            data: { data: docs },
        });
    });
