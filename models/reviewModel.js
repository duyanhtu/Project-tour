const mongoose = require('mongoose');

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
reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});
// nếu dùng reviewSchma.post(..., function(){}): Post sẽ không được sử dụng next();
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
    console.log(stats);
};
const Review = mongoose.model('Reivew',reviewSchema);
module.exports = Review;