const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const studentSchema = new mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    }],
    degree: {
        type: String,
    },
    course: {
        type: String,
    },

}, {timestamps: true});

const Student = mongoose.model('student', studentSchema);

module.exports = Student;