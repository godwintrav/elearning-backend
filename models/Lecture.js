const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const lectureSchema = new mongoose.Schema({
    playlist: [{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "No playlistId found"],
        ref: "playlist"
    }],
    link: {
        required: false,
        type: String
    },
    title: {
        required: [true, "Please enter the category name"],
        type: String
    },
    uri: {
        required: false,
        type: String
    },
    duration: {
        type: mongoose.Decimal128,
        required: false
    },
    material: {
        type: String,
        required: false,
    },
    fileType: {
        type: String,
        required: true,
    }
}, { timestamps: true });


const Lecture = mongoose.model('lecture', lectureSchema);
module.exports = Lecture;