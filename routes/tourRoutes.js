const express = require('express')
const {getAllTours, createTour, getTour, updateTour, deleteTour, checkId, checkBody} = require('../controllers/tourController')

const router = express.Router()

// local middleware
router.param('id', checkId)
router.param('name', (req, res, next, val) => {
    console.log('val', val)
    next()
})

router.route("/").get(getAllTours).post(checkBody, createTour);
router.route("/:id")
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router