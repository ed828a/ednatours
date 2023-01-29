const express = require('express')
const {getAllTours, createTour, getTour, updateTour, deleteTour, checkId, checkBody, aliasTopTours} = require('../controllers/tourController')


const router = express.Router()

// local middleware
// router.param('id', checkId)
router.param('id', (req, res, next, val) => {
    console.log('val', val)
    next()
})

router.route('/top-5-cheap').get(aliasTopTours, getAllTours)
router.route("/").get(getAllTours).post(checkBody, createTour);
router.route("/:id")
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router