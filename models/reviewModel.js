const mongoose = require('mongoose');
const Tour = require('./tourModel')
const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type : mongoose.Schema.Types.ObjectId,
            ref: 'Tour', 
            required: [true, 'Review must belong to a tour']
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);
reviewSchema.index({tour: 1, user: 1}, {unique: true});
reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});
reviewSchema.statics.calcAverangeRatings = async function(tourId){

    const stats = await this.aggrate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1},
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    if(stats.length > 0){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage : stats[0].nRating,
            ratingsQuantity : stats[0].avgRating
        });
    }
    else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsAverage: 4.5,
            ratingsQuantity: 0
        });
    }
};
// reviewSchema.post(/^find/, async function(){
//     await this.constructor.calcAverangeRatings(this.tour);
// });

reviewSchema.pre(/^findOneAnd/, async function(next){
    this.r = await Tour.findOne();
    next();
});
reviewSchema.post(/^findOneAnd/,async function(){
    await this.r.constructor.calcAverangeRatings(this.r.tour);
});
const Review = mongoose.model('Reivew',reviewSchema);
module.exports = Review;