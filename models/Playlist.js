const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const playlistSchema = new mongoose.Schema({
    course: [{
        type: mongoose.Schema.Types.ObjectId,
        required: [true, "Please enter the courseID"],
        ref: "course"
    }],
    name: {
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters'],
        required: [true, "Please enter the playlist name"]
    }
}, {timestamps: true});

const Playlist = mongoose.model('playlist', playlistSchema);

module.exports = Playlist;