const fs = require("fs");

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);
// console.log(tours)

exports.getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: { tours },
    });
};

exports.createTour = (req, res) => {
    // console.log(req.body)
    const newId = tours[tours.length - 1].id + 1;
    const newTour = Object.assign({ id: newId }, req.body);
    tours.push(newTour);
    fs.writeFile(
        `${__dirname}/dev-data/data/tours-simple.json`,
        JSON.stringify(tours),
        (err) => {
            if (!err) {
                res.status(201).json({
                    status: "success",
                    results: tours.length,
                    data: { tours },
                });
            } else {
                res.status(500).json({ status: "failure" });
            }
        }
    );
};

exports.getTour = (req, res) => {
    console.log(req.params);

    const tour = tours.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string
    // if (tour) {
        res.status(200).json({
            status: "success",
            data: { tour },
        });
    // } else {
    //     res.status(404).json({ status: "failure", message: "No Such Tour" });
    // }
};

exports.updateTour = (req, res) => {
    console.log(req.params);
    console.log(req.body);

    const tour = tours.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string
    const newTour = { ...tour, ...req.body };

    // if (tour) {
        const updatedTours = tours.map((el) =>
            el.id === req.params.id * 1 ? newTour : el
        );

        fs.writeFile(
            `${__dirname}/dev-data/data/tours-simple.json`,
            JSON.stringify(updatedTours),
            (err) => {
                if (!err) {
                    res.status(200).json({
                        status: "success",
                        data: { tour: newTour },
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
    // } else {
    //     res.status(404).json({ status: "failure", message: "No Such Tour" });
    // }
};

exports.deleteTour = (req, res) => {
    console.log(req.params);

    // const tour = tours.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string

    // if (tour) {
        const updatedTours = tours.filter((el) => el.id !== req.params.id * 1);

        fs.writeFile(
            `${__dirname}/dev-data/data/tours-simple.json`,
            JSON.stringify(updatedTours),
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
    // } else {
    //     res.status(404).json({ status: "failure", message: "No Such Tour" });
    // }
};

exports.checkId = (req, res, next, val) => {
    console.log('val: ', val)
    const tour = tours.find((el) => el.id === req.params.id * 1);
    if(!tour) {
        res.status(404).json({ status: "failure", message: "No Such Tour" });
    } else {
        next()
    }
}

exports.checkBody = (req, res, next) => { // middleware to check if body has name and price fields.
    if(req.body.name && req.body.price){
        next()
    } else {
       return res.status(400).json({message: "no price or name in body"})
    }
}