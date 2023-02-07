const fs = require("fs");
const mongoose = require("mongoose");
const Tour = require("../models/tourModel");

mongoose.set("strictQuery", true);

const importData = async () => {
    try {
        const toursFromFile = JSON.parse(
            fs.readFileSync(`${__dirname}/../dev-data/data/tours.json`)
        );
        await Tour.create(toursFromFile);
        console.log("Creation done!!");
    } catch (error) {
        console.log(error);
    }
};

const removeData = async () => {
    try {
        await Tour.deleteMany();
        console.log("Delete done!!");
    } catch (error) {
        console.log(error);
    }
};

const searchData = async (query) => {
    try {
        const result = await Tour.find();
        console.log("Search done!!");
        console.log('result: ', result)
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
