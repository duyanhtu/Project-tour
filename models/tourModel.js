const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'A tour must have a name'],
            unique: true,
            trim: true, 
            maxlength: [40, 'A tour name must have less or equal then 40 characters'],
            minlenght: [10, 'A tour name must have more or equal then 10 characters'],
        },
        slug: String,
        duration: {
            type: Number,
            required: [true, 'A tour must have a duration']
        },
        maxGroupSize:{
            type: Number,
            required: [true, 'A tour must have a group size']
        },
        difficulty : {
            type : String,
            required : [true,'A tour must have a difficulty'],
            enum : {
            values : ['easy','medium','difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
            }
        },
        ratingsAverage:{
            type: Number, 
            default: 4.5,
            min: [1, 'Rating must be above 1'],
            max: [5, 'Rating must be below 5'],
            //VD: 4.666666 * 10 = 46.6666 => làm tròn 47 / 10 = 4.7
            set: val => Math.round(val * 10) / 10
        },
        ratingsQuantity:{
            type: Number,
            default: 0
        },
        price: {
            type: Number,
            required: [true, 'A tour must have a price']
        },
        priceDiscount:{
            type: Number,
            validate: function(val){ 
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        },   
        summary:{
            type: String,
            trim: true, 
            required : [true, 'A tour must have a description']
        },
        description:{
            type: String,
            trim: true,
            required: [true, 'A tour must have a description']
        },
        imageCover:{
            type: String,
            required: [true, 'A tour must have a cover image']
        },
        images: [String],
        createdAt: {
            type: Date,
            default: Date.now(),
            select: false
        },
        startDates: [Date],
        secretTour: {
            type: Boolean,
            default: false
            },
        startLocation: {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            adress: String,
            description: String
        },
        locations: [
            {
                type: {
                    type: String,
                    default: 'Point',
                    enum: ['Point']
                },
                coordinates: [Number],
                adress: String, 
                description: String,
                day: Number
            }
        ],
        guides: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }]
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

tourSchema.index({price: 1, ratingAverage: -1});
tourSchema.index({slug: 1});
tourSchema.index({startLocation: '2dsphere'});
tourSchema.virtual('durationWeeks').get(function (){
    return this.duration / 7;
});
tourSchema.virtual('reviews',{
    ref: 'Reivew',
    foreignField: 'tour', 
    localField: '_id'
});
//Document middleware: runs save() or create()
tourSchema.pre('save', function(next){
    this.slug = slugify(this.name, {lower: true});
    next();
});
tourSchema.pre(/^find/, function(next){
    this.find({ secretTour: {$ne: true} });
    this.start = Date.now();
    next();
});
tourSchema.pre(/^find/, function(next){
    this.populate({ path: 'guides', select: '-__v -passwordChangedAt -passwordResetToken'});
    next();
});

// tourSchema.post(/^find/, function(docs, next){
//     console.log(`Query took ${Date.now() - this.start} miliseconds`);
//     // console.log(docs);
//     next();
// });


// AGGEGATION MIDDLEWARE
// tourSchema.pre('aggregate', function(next){
//     this.pipeline({ $match: { secretTour: {$ne: true}}});
//     // console.log(this.pipeline());
//     next();
// });
//model(): tạo ra một bản sao của schema. Đảm bảo rằng bạn đã thêm mọi thứ bạn muốn schema
//,bao gồm cả hook, trước khi gọi .model()
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour; 