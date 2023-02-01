const fs = require("fs");
const User = require("../models/userModel");
const AppError = require("../utils/appError");
const catchAsyncError = require("../utils/catchAsyncError");

// const users = JSON.parse(
//     fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
// );

// console.log(users)

// exports.getAllUsers = (req, res) => {
//     res.status(200).json({
//         status: "success",
//         results: users.length,
//         data: { users },
//     });
// };

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    const users = await User.find();

    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users },
    });
});

exports.createUser = (req, res) => {
    // console.log(req.body)
    const newId = users[users.length - 1].id + 1;
    const newUser = Object.assign({ id: newId }, req.body);
    users.push(newUser);
    fs.writeFile(
        `${__dirname}/dev-data/data/users.json`,
        JSON.stringify(users),
        (err) => {
            if (!err) {
                res.status(201).json({
                    status: "success",
                    results: users.length,
                    data: { users },
                });
            } else {
                res.status(500).json({ status: "failure" });
            }
        }
    );
};

exports.getUser = (req, res) => {
    console.log(req.params);

    const user = users.find((el) => el._id === req.params.id); // pre.params.id * 1 make it's a number, not a string
    if (user) {
        res.status(200).json({
            status: "success",
            data: { user },
        });
    } else {
        res.status(404).json({ status: "failure", message: "No Such User" });
    }
};

// this is for admin to manage users
exports.updateUser = (req, res) => {
    console.log(req.params);
    console.log(req.body);

    const user = users.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string
    const newUser = { ...user, ...req.body };

    if (user) {
        const updatedUsers = users.map((el) =>
            el.id === req.params.id * 1 ? newUser : el
        );

        fs.writeFile(
            `${__dirname}/dev-data/data/tours-simple.json`,
            JSON.stringify(updatedUsers),
            (err) => {
                if (!err) {
                    res.status(200).json({
                        status: "success",
                        data: { user: newUser },
                    });
                } else {
                    console.log(err);
                    res.status(500).json({
                        status: "failure",
                        message: "Updating Failed.",
                    });
                }
            }
        );
    } else {
        res.status(404).json({ status: "failure", message: "No Such User" });
    }
};

exports.deleteUser = (req, res) => {
    console.log(req.params);

    const user = users.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string

    if (user) {
        const updatedUsers = users.filter((el) => el.id !== req.params.id * 1);

        fs.writeFile(
            `${__dirname}/dev-data/data/tours-simple.json`,
            JSON.stringify(updatedUsers),
            (err) => {
                if (!err) {
                    res.status(204).json({ status: "success", data: null });
                } else {
                    console.log(err);
                    res.status(500).json({
                        status: "failure",
                        message: "Updating Failed.",
                    });
                }
            }
        );
    } else {
        res.status(404).json({ status: "failure", message: "No Such User" });
    }
};

const filterObj = (obj,...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach((el) => {
        if (allowedFields.includes(el)) {
            newObj[el] = obj[el];
        }
    });
    return newObj;
};
    

// this is user update its self document
exports.updateMe = catchAsyncError(async (req, res, next) => {
    // 1) create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm) {
        return next( new AppError( "This route is not for password update/ Please use /updateMyPassword", 400));
    }
    // 2) Filter out unwanted fields that are not allowed to be updated
    const filteredBody = filterObj(req.body, 'name', 'email')

    // Update user document, here we can't use save() because some required fields are missing
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    
    res.status(200).json({
        status: "success",
        data: { user },
     })
})

// When user deletes his account, we don't actually delete its account. Just mark it disabled. Only Admin can delete accounts.
exports.deleteMe = catchAsyncError(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, { active: false })
    res.status(204).json({ status: "success", data: null })    
})

