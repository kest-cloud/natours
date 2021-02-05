const express = require('express');
const authController = require ('./../controllers/authController');
const reviewController = require ('./../controllers/reviewController');


const router  = express.Router();

router.route('/').post(authController.protect, authController.retrictTo, reviewController.createReview);


router.route('/:id').get(reviewController.getReview); 
router.route('/').get(reviewController.getAllReviews);


module.exports = router;
