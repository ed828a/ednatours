const express = require("express");
const fs = require("fs");
const morgan = require("morgan");

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);
const users = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/users.json`)
);
// console.log(tours)
// console.log(users)

const app = express();

app.use(express.json());
app.use(morgan("dev"));

const getAllTours = (req, res) => {
    res.status(200).json({
        status: "success",
        results: tours.length,
        data: { tours },
    });
};

const createTour = (req, res) => {
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

const getTour = (req, res) => {
    console.log(req.params);

    const tour = tours.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string
    if (tour) {
        res.status(200).json({
            status: "success",
            data: { tour },
        });
    } else {
        res.status(404).json({ status: "failure", message: "No Such Tour" });
    }
};

const updateTour = (req, res) => {
    console.log(req.params);
    console.log(req.body);

    const tour = tours.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string
    const newTour = { ...tour, ...req.body };

    if (tour) {
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
    } else {
        res.status(404).json({ status: "failure", message: "No Such Tour" });
    }
};

const deleteTour = (req, res) => {
    console.log(req.params);

    const tour = tours.find((el) => el.id === req.params.id * 1); // pre.params.id * 1 make it's a number, not a string

    if (tour) {
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
    } else {
        res.status(404).json({ status: "failure", message: "No Such Tour" });
    }
};

const getAllUsers = (req, res) => {
    res.status(200).json({
        status: "success",
        results: users.length,
        data: { users },
    });
};

const createUser = (req, res) => {
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

const getUser = (req, res) => {
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

const updateUser = (req, res) => {
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

const deleteUser = (req, res) => {
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

// app.get("/api/v1/tours", getAllTours);
// app.post("/api/v1/tours", createTour);
// app.get("/api/v1/tours/:id", getTour);
// app.patch("/api/v1/tours/:id", updateTour);
// app.delete("/api/v1/tours/:id", deleteTour);

app.route("/api/v1/tours").get(getAllTours).post(createTour);
app.route("/api/v1/tours/:id")
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

app.route("/api/v1/users").get(getAllUsers).post(createUser);
app.route("/api/v1/users/:id")
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);

const port = 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}...`);
});
