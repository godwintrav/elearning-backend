const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const lectureSchema = new mongoose.Schema({
    course: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "course"
    }],
    link: {
        required: [true, "Please enter the category name"],
        type: String
    },
    title: {
        required: [true, "Please enter the category name"],
        type: String
    },
    description: {
        required: [true, "Please enter the category name"],
        type: String
    },
    uri: {
        required: [true, "Uri not sent"],
        type: String
    }  
}, { timestamps: true });


const Lecture = mongoose.model('lecture', lectureSchema);
module.exports = Lecture;