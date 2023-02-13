const express = require("express");
const { restrictTo, protect } = require("../controllers/authController");
const {
    getAllReviews,
    createReview,
    getReviews,
    getReview,
    deleteReview,
    updateReview,
    setTourUserIds,
} = require("../controllers/reviewController");

// by default, each route only have access to the parameters of their specific routes,
// and because this router will nest to tour routes, and we need access to the tour id,
// so we set mergeParams: true to merge the tour routes parameters.
const router = express.Router({ mergeParams: true });

router.use(protect);

router
    .route("/")
    .get(getAllReviews)
    .post(restrictTo("user"), setTourUserIds, createReview);

router
    .route("/:id")    
    .get(getReview)
    .patch(restrictTo('user', 'admin'), updateReview) //todo: if user, user can update only his own review
    .delete(restrictTo("user", "admin"), deleteReview);

module.exports = router;
