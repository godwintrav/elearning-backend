const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const courseSchema = new mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please enter the Instructor userID"],
        ref: "user",
    }],
    category: [{
          type: mongoose.Schema.Types.ObjectId,
          required: [true, "Please enter the category"],
          ref: "category",
    }],
    thumbnail: {
          type: Map,
          of: String, 
          required: [true, "Please upload course image"]
    },
   title: {
       type: String,
       max: [255, 'Maximum characters allowed is 255 characters'],
       required: [true, "Please enter the course title"]
   },
   whatYouLearn: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: [true, "Please enter course what you will learn"]
   },
   requirement: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters']
   },
   description: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: [true, "Please enter the course description"]
   },
   secondTitle: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: [true, "Please enter the course sub title"]
   },
   isApproved: {
     type: Boolean,
     default: false,
 },
 price: {
     type: mongoose.Decimal128,
     required: false,
 },


}, {timestamps: true});

const Course = mongoose.model('course', courseSchema);

module.exports = Course;