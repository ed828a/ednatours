const express = require("express");
const { protect, restrictTo } = require("../controllers/authController");
// const {
//     getReviews,
//     createReview,
//     getReview,
// } = require("../controllers/reviewController");
const {
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    checkId,
    checkBody,
    aliasTopTours,
    getTourStats,
    getMonthlyPlan,
    getToursWithinRadius,
    getDistances,
} = require("../controllers/tourController");
const reviewRouter = require("../routes/reviewRoutes");

const router = express.Router();

// local middleware
// router.param('id', checkId)
router.param("id", (req, res, next, val) => {
    console.log("val", val);
    next();
});

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router
    .route("/monthly-plan/:year")
    .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
router
    .route("/tours-within/:distance/center/:latlng/unit/:unit")
    .get(getToursWithinRadius);

router.route("/distances/:latlng/unit/:unit").get(getDistances);


router
    .route("/")
    .get(getAllTours)
    .post(protect, restrictTo("admin", "lead-guide"), checkBody, createTour);

router
    .route("/:id")
    .get(getTour)
    .patch(protect, restrictTo("admin", "lead-guide"), updateTour)
    .delete(protect, restrictTo("admin", "lead-guide"), deleteTour);

// router is just a middleware, so we can use 'use' method on it
router.use("/:tourId/reviews", reviewRouter); // reviewRouter need to merge /:tourId/ param

// router
//     .route("/:tourId/reviews")
//     .get(getReviews)
//     .post(protect, restrictTo("user"), createReview);

// router.route("/:tourId/reviews/:reviewId").get(getReview);

module.exports = router;
