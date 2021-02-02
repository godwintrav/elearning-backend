const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);

const instructorSchema = new mongoose.Schema({
    user: [{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    }],
    instructorType: {
        required: [true, "Please enter instructor type"],
        type: String,
    },
    companyName: {
        type: String,
        required: false
    },
    incorporationCertificate: {
        type: Map,
        of: String, 
        required: false
    },
    trainingLicence: {
        type: Map,
        of: String, 
        required: false
    },
    expertise: {
        type: String,
        required: false
    },
    experience: {
        type: Number,
        required: false
    },
    cv: {
     type: Map,
     of: String, 
     required: false
    },
    isVerified: {
        type: Boolean,
        required: true,
    }
}, {timestamps: true});

const Instructor = mongoose.model('instructor', instructorSchema);

module.exports = Instructor;