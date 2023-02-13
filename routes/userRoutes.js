const express = require("express");
const {
    signup,
    login,
    forgotPassword,
    resetPassword,
    updatePassword,
    protect,
    restrictTo,
} = require("../controllers/authController");
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe,
} = require("../controllers/userController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/forgotPassword", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

// all routes after this middleware will be protected
router.use(protect);

router.patch("/updateMyPassword", updatePassword);
router.route("/me").get(getMe, getUser).patch(updateMe).delete(deleteMe);

// all routes after this middleware will be restricted to admin
router.use(restrictTo('admin'))
router.route("/").get(getAllUsers).post(createUser);
router.route("/:id").get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
