const Instructor = require('../models/Instructor');
const User = require('../models/User');
const Student = require('../models/Student');
const Category = require('../models/Category');
const errorController = require('./errorController');
const cryptoRandomString = require('crypto-random-string');

module.exports.fetchAllInstructors = async (req, res) => {
    try{
        const instructors = await Instructor.find().populate({ path: 'user',  select: "email firstName lastName address phone userType"}).sort({ createdAt: -1 });
        res.json( instructors );
    } catch(errors){
        res.status(404).json({ errors: errors.message });
    }
    
}

module.exports.fetchInstructor = async (req, res) => {
    const id = req.params.id;
    try{
        const instructor = await Instructor.findById(id).populate({ path: 'user',  select: "email firstName lastName address phone userType"});
        if(!instructor){
            res.status(404).json({ error: "User not found" });
        }
        res.json( instructor );
    }catch(errors){
        res.status(404).json({ error: "Instructor not found" });
    }
}

module.exports.verifyCorporateInstructor = async (req, res) => {
    const id = req.params.id;
    try{
        const updatedInstructor = await Instructor.findByIdAndUpdate(id, {isVerified: true } );
        res.json({msg: "Instructor successfully updated"});
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.blockUser = async (req, res) => {
    const id = req.params.id;
    try{
        const blockedUser = await User.findByIdAndUpdate(id, { isBlocked: true } );
        res.json({msg: "User Blocked Successfully"});
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchCorporateInstructors = async (req, res) => {
    try{
        const instructors = await Instructor.find({ instructorType: "corporate" }).populate({ path: 'user',  select: "email firstName lastName address phone userType"}).sort({ createdAt: -1 });
        res.json( instructors );
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchUsers = async (req, res) => {
    try{
        const users = await User.find().sort({ createdAt: -1 });
        res.json( users );
    } catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchUser = async (req, res) => {
    const id = req.params.id;
    try{
        const user = await User.findById(id);
        if(!user){
            res.status(404).json({ error: "User not found" });
        }
        res.json( user );
    }catch(errors){
        res.status(404).json({ error: "User not found" });
    }
}


module.exports.fetchStudents = async (req, res) => {
    
    try{
        const students = await Student.find().populate({ path: 'user', select: "email firstName lastName address phone userType"}).sort({ createdAt: -1 });
        res.json( students );
    } catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchStudent = async (req, res) => {
    const id = req.params.id;
    try{
        const student = await Student.findById(id).populate({ path: 'user',  select: "email firstName lastName address phone userType"});
        if(!student){
            res.status(404).json({ error: "User not found" });
        }
        res.json( student );
    }catch(errors){
        res.status(404).json({ error: "Student not found" });
    }
}

module.exports.viewCertificate = async (req, res) => {
    const id = req.params.id;
    const instructor = await Instructor.findById(id);
        console.log(instructor);
        var b64string = instructor.incorporationCertificate.get('data');
        var buf = Buffer.from(b64string, 'base64');
        res.writeHead(200, { "Content-type": instructor.incorporationCertificate.get('mimetype')});
        res.end(buf);
}

module.exports.viewLicence = async (req, res) => {
    const id = req.params.id;
    const instructor = await Instructor.findById(id);
        console.log(instructor);
        var b64string = instructor.trainingLicence.get('data');
        var buf = Buffer.from(b64string, 'base64');
        res.writeHead(200, { "Content-type": instructor.trainingLicence.get('mimetype')});
        res.end(buf);
}

module.exports.addCategory = async (req, res) => {
    const {category} = req.body;
    try{
        const newCategory = await Category.create({ category });
        res.status(201).json({ message: "Category Added Successfully" });
    }catch(errors){
        res.status(500).json({ error: "Error adding caregory" });
    }
}

module.exports.fetchCategories = async (req, res) => {
    try{
        const categories = await Category.find().sort({ createdAt: -1 });
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.registerAdmin = async (req, res) => {
    const {email, password, firstName, lastName} = req.body;
    const verifyId = cryptoRandomString({length: 30});
    try{
        const user = await User.create({email: email, firstName: firstName, lastName: lastName, password: password, isVerified: true, address: "admin", phone: "admin", userType: "admin", verifyId: verifyId});
        res.status(201).json({ user: user });
    }catch(err){
        const errors = errorController.handleAuthErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.deleteCategory = async (req, res) => {
    const { categoryId } = req.body;

    try{
        const deletedCategory = await Category.findByIdAndDelete(categoryId);
        res.json(deletedCategory);
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}