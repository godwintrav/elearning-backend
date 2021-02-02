const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const courseSchema = new mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user",
    }],
    category: [{
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "category",
    }],
   title: {
       type: String,
       max: [255, 'Maximum characters allowed is 255 characters'],
       required: true
   },
   whatYouLearn: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: true
   },
   requirement: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters']
   },
   description: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: true
   },
   secondTitle: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: true
   }

}, {timestamps: true});

const Course = mongoose.model('course', courseSchema);

module.exports = Course;