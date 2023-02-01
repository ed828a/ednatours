const express = require("express");
const { protect } = require("../controllers/authController");
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
} = require("../controllers/tourController");

const router = express.Router();

// local middleware
// router.param('id', checkId)
router.param("id", (req, res, next, val) => {
    console.log("val", val);
    next();
});

router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router.route('/monthly-plan/:year').get(getMonthlyPlan)

router.route("/").get(protect, getAllTours).post(checkBody, createTour);
router.route("/:id").get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
