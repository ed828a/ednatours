const fs = require("fs");
const mongoose = require("mongoose");
const Review = require("../models/reviewModel");
const Tour = require("../models/tourModel");
const User = require("../models/userModel");

mongoose.set("strictQuery", true);

const importData = async () => {
    try {
        const toursFromFile = JSON.parse(
            fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`)
        );
        const usersFromFile = JSON.parse(
            fs.readFileSync(`${__dirname}/../dev-data/data/users.json`)
        );
        const reviewsFromFile = JSON.parse(
            fs.readFileSync(`${__dirname}/../dev-data/data/reviews.json`)
        );

        await Tour.create(toursFromFile);
        await User.create(usersFromFile, {validateBeforeSave: false});
        await Review.create(reviewsFromFile);
        console.log("Creation done!!");
    } catch (error) {
        console.log(error);
    }
};

const removeData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Delete done!!");
    } catch (error) {
        console.log(error);
    }
};


mongoose
    .connect(process.env.MONGO_DB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(async (con) => {
        console.log("DB connection is successful!");
        console.log(process.argv[2]);
        switch (process.argv[2]) {
            case "import": {
                await importData();
                break;
            }
            case "delete": {
                await removeData();
                break;
            }
            case "search": {
                await searchData();
                break;
            }
        }
        process.exit(0);
    })
    .catch((err) => console.error(err));
