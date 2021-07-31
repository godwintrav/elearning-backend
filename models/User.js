const mongoose = require('mongoose');
mongoose.set('useFindAndModify', false);
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');
const emailController = require('../controllers/emailController');


const userSchema = new mongoose.Schema({
    firstName:{
        required: [true, "Please enter your first name"],
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters']
    },
    lastName:{
        required: [true, "Please enter your last name"],
        type: String,
        max: [255, 'Maximum characters allowed is 255 characters']
    },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Minimum password length is 6 characters'],
        required: [true, "Please enter your password"]
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verifyId: {
        type: String,
        required: true,
        unique: true,
    },
    address: {
        type: String,
        required: [true, "Please enter your address"],
    },
    phone: {
        type: String,
        required: [true, "Please enter your phone number"],
    },
    userType: {
        type: String,
        required: [true, "Please enter your user type"],
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
}, {timestamps: true});

//hash password before doc is saved
userSchema.pre('save', async function(next){
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

//send email after doc is saved
userSchema.post('save', async function(doc, next){
    try{    
        let link = process.env.BASE_URL + "api/auth/" + doc.verifyId;
        const result = await emailController.sendVerificationEmail(link, doc.email, doc.firstName);
        next();

    }catch(err){
        console.log(err);
        next();
    }
    
})

//static method to login user
userSchema.statics.login = async function(email, password){
    const user = await this.findOne({ email });
    if(user){

        if(user.isVerified){
            const auth = await bcrypt.compare(password, user.password);

            if(auth){
                return user;
            }

            throw Error('incorrect login');
        }

        throw Error('unverified email');
    }

    throw Error('incorrect login');
}

const User = mongoose.model('user', userSchema);

module.exports = User;