const User = require('../models/User');
const Student = require('../models/Student');
const Instructor = require('../models/Instructor');
const jwt = require('jsonwebtoken');
const cryptoRandomString = require('crypto-random-string');
const errorController = require('./errorController');
const emailController = require('./emailController');
//console.log(process.env.SECRET_CODE);
// maximum time for jwt
const maxAge = 3 * 24 * 60 * 60;

//Create JWT
const createToken = (id, scopes) => {
    const payload = {
        id: id,
        scopes: scopes
    }
    return jwt.sign( payload, process.env.SECRET_CODE, { expiresIn: maxAge });
}

module.exports.student_signup_post = async (req, res) => {
    const {firstName, lastName, email, password, userType, address, phone} = req.body;
    const verifyId = cryptoRandomString({length: 30});
    let token_name = '';
    let user = null;
    //console.log(req.body);

    try{

        
        if(userType === "student"){

            const isValid = errorController.checkStudentErrors(req);
            user = await User.create({firstName, lastName, email, password, verifyId, address, phone, userType });
            const {degree, course} = req.body;
            const student = await Student.create({ user: user._id, course: course, degree: degree });
            token_name = 'student_token';

        } else{
            throw Error("invalid userType");
        }


        const token = createToken(user._id, ["admin", "student"]);
        //remember to add secure when in production
        res.cookie(token_name, token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({ user: user._id, token: token });

    }catch(err){
        const errors = errorController.handleAuthErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.instructor_signup_post = async (req, res) => {
    const {firstName, lastName, email, password, userType, address, phone, instructorType} = req.body;
    const verifyId = cryptoRandomString({length: 30});
    let token_name = '';
    let user = null;
    //console.log("this is body", req.files);

    token_name = 'instructor_token';

        try{

            if(userType === "instructor"){

                if(instructorType === "corporate"){
    
                    const isValid = errorController.checkCorporateErrors(req);
                    user = await User.create({firstName, lastName, email, password, verifyId, address, phone, userType });
                    const {instructorType, companyName} = req.body;
                    const instructor = await Instructor.create({ 
                        user: user._id,
                        companyName: companyName,
                        incorporationCertificate: {
                            data: req.files['incorporationCertificate'][0].buffer.toString('base64'),
                            mimetype: req.files['incorporationCertificate'][0].mimetype
                            },
                        trainingLicence: {
                            data: req.files['trainingLicence'][0].buffer.toString('base64'),
                            mimetype: req.files['trainingLicence'][0].mimetype
                            },
                        instructorType: instructorType,
                        isVerified: false,
                    });
        
                } else if(instructorType === "individual"){
        
                    const isValid = errorController.checkIndividualErrors(req);
                    user = await User.create({firstName, lastName, email, password, verifyId, address, phone, userType });
                    const {instructorType, expertise, experience} = req.body;
                    const instructor = await Instructor.create({ user: user._id, instructorType: instructorType, expertise: expertise, experience: experience, isVerified: true,
                        cv: {
                             data: req.files['cv'][0].buffer.toString('base64'),
                             mimetype: req.files['cv'][0].mimetype
                             } });
        
                }else{
                    throw Error("invalid instructorType");
                }
                
            }else{
                throw Error("invalid userType");
            }  


        const token = createToken(user._id, ["admin", "instructor"]);
        //remember to add secure when in production
        res.cookie(token_name, token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(201).json({ user: user._id, token: token });

        }catch(err){
               
            const errors = errorController.handleAuthErrors(err);
            res.status(400).json({ errors });

        }

}

module.exports.login_post = async (req, res) => {
    const {email, password} = req.body;
    let token_name = '';
    let token = '';

    try{
        const user = await User.login(email, password);

        if(user.userType === "student"){
            token_name = 'student_token';   
            token = createToken(user._id, ["student"]);         
        }else if(user.userType === "instructor"){
            token_name = 'instructor_token';
            token = createToken(user._id, ["instructor"]);
        } else if(user.userType === "admin"){
            token_name = 'admin_token';
            token = createToken(user._id, ["admin"]);
        }else {
            res.status(400).json({ errors: "Invalid userType" });
        }
        //remember to add secure when in production
        res.cookie(token_name, token, { httpOnly: true, maxAge: maxAge * 1000});
        res.status(200).json({ token: token, type: user.userType, email: user.email });
    }catch(err){
        const errors = errorController.handleAuthErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.pdf = async (req, res) => {
    const id = req.params.id;
    const instructor = await Instructor.findOne({ user: id});
        //console.log(instructor);
        var b64string = instructor.incorporationCertificate.get('data');
        var buf = Buffer.from(b64string, 'base64');
        res.writeHead(200, { "Content-type": instructor.incorporationCertificate.get('mimetype')});
        res.end(buf);
}

module.exports.verify_email_get = async (req, res) => {
    const verifyId = req.params.verifyId;
    try{
        const user = await User.findOne({ verifyId });
        if(user){
            try{
                const updatedUser = await User.findByIdAndUpdate(user._id, {isVerified: true } );
                res.json({verified: true});
            }catch(errors){
                res.status(400).json({ errors: errors.message });
            }
        } 
    } catch(err){
        res.status(400).json({ errors: "Unrecognized Link" });
    }
    
}

module.exports.getCurrentUser = async (req, res) => {
    const {id} = req.body;

    try{
        const user = await User.findById(id);
        if(user){
            res.json({ firstName: user.firstName, lastName: user.lastName, email: user.email, address: user.address, phone: user.phone, userType: user.userType});
        } else{
            res.status(404).json({ errors: "User not Found" });
        }
    }catch(err){
        res.status(404).json({ errors: "User not Found" });
    }
}

module.exports.resendVerificationLink = async (req, res) => {
    const { email } = req.body;

    try{
        const user = await User.findOne({ email });
        if(!user){
            res.status(404).json({ errors: "User not Found"});
        }
        //console.log(user);
        let link = process.env.BASE_URL + "api/auth/" + user.verifyId;   
        const result = await emailController.sendVerificationEmail(link, user.email, user.firstName);
        res.json({ message: "Verification link sent to email address"});

    }catch(err){
        //console.log(err);
        res.status(500).json({ errors: "Error sending verification Link"});
    }
    
}