const mongoose = require('mongoose');

//text, ratings, createdAt, ref to tour, ref to user

const reviewSchema = new mongoose.Schema ({
    review: {
        type: String,
        required: [true, 'You havent made any review yet']
    },
    ratings: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour:  
        {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
       },
    
    user: 
              {  
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user.']
       },
    
},
  {
    toJSON: { virtuals: true},
    toObject: { virtuals: true }
}
);

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'tour',
        select: '-guides name'
    }).populate({
        path: 'user',
        select:'name photo'

    });
    next();
});


const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;