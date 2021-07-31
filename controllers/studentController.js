const Course = require("../models/Course");
const Lecture = require("../models/Lecture");
const User = require("../models/User");
const Category = require('../models/Category');
const Playlist = require("../models/Playlist");
const PurchasedCourse = require("../models/PurchasedCourse");
const axios = require('axios');
const { rawListeners } = require("../models/Category");


module.exports.fetchAllCourses = async (req, res) => {
    try{
        const courses = await Course.find({}, "_id title category user whatYouLearn requirement description secondTitle price").populate({ path: 'user',  select: "email firstName lastName address phone userType"}).populate({ path: 'category',  select: "name"}).sort({ createdAt: -1 });
        if(courses){
            res.json(courses);
        }else{
            res.status(404).json({ errors: "Not Found" });
        }
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchInstructorCourses = async (req, res) => {
    const instructorId = req.params.id;
    try{
        const courses = await Course.find({ user: instructorId }, "_id title category user whatYouLearn requirement description secondTitle price").populate({ path: 'user',  select: "email firstName lastName address phone userType"}).populate({ path: 'category',  select: "name"}).sort({ createdAt: -1 });
        if(courses){
            res.json(courses);
        }else{
            res.status(404).json({ errors: "Not Found" });
        }
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}


module.exports.viewCourse = async (req, res) => {
    const {courseId, userId} = req.body;
    try{
        const course = await Course.findById(courseId, "_id title category user whatYouLearn requirement description secondTitle price");
        if(!course){
            res.status(404).json({ errors: "Course not found" });
        }
        const instructor = await User.findById(course.user, "email firstName lastName address phone userType");
        var modules = await getPlaylists(courseId, userId);
        res.json({course: course, modules: modules, instructor: instructor });
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchPlaylists = async (req, res) => {
    const courseId = req.params.id;
    try{
        const courseName = await Course.findById(courseId, "title");
        var modules = await getPlaylists(courseId);
        res.json({modules, courseName: courseName.title});
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

const getPlaylists = async (courseId, userId) => {
    try{
        var modules = [];
        let lectures;
        var playlists = await Playlist.find({course: courseId}, '_id name');
        const isPurchased = PurchasedCourse.findOne({$and: [{course: courseId }, {student: userId}]}, '_id');
        for (let index = 0; index < playlists.length; index++) {
            var module = {
                videos: []
            };
            module['sectionTitle'] = playlists[index].name;
            module['id'] = playlists[index]._id;
            if(isPurchased){
                lectures = await fetchPurchasedLectures(playlists[index]._id);
            }else{
                lectures = await fetchLectures(playlists[index]._id);
            }
            module.videos = lectures;
            modules.push(module);
            ////console.log(module);
        }
        return modules
    }catch(errors){
        throw Error(errors.message);
    }
}

const fetchLectures = async (id) => {
    try{
        const lectures = await Lecture.find({playlist: id}, '_id title duration fileType');
        return lectures;
    }catch(err){
        throw Error(err.message);
    }
} 

const fetchPurchasedLectures = async (id) => {
    try{
        const lectures = await Lecture.find({playlist: id}, '_id title link uri duration fileType');
        return lectures;
    }catch(err){
        throw Error(err.message);
    }
} 

const fetchCourse = async (courseId) => {
    try{
        const course = await Course.findById(courseId, "_id title category user whatYouLearn requirement description secondTitle price").populate({ path: 'user',  select: "email firstName lastName address phone userType"}).populate({ path: 'category',  select: "name"}).sort({ createdAt: -1 });
        return course;
    }catch(errors){
        throw Error(errors.message);
    }
}

module.exports.studentPurchasedCourses = async (req, res) => {
    const studentId = req.params.id;
    try{
        let courses = [];
        const purchasedCourses = await PurchasedCourse.find({student: studentId}, 'course');
        //console.log(purchasedCourses);
        for (let index = 0; index < purchasedCourses.length; index++) {
            let course = await fetchCourse(purchasedCourses[index].course);
            courses.push(course);
            
        }
        res.json(courses);
    }catch(error){
        res.status(404).json({ errors: error.message });
    }
}

module.exports.viewLecture = async (req, res) => {
    const lectureId = req.params.id;
    try{
        const lecture = await Lecture.findById(lectureId, '_id title link uri duration fileType playlist');
        const courseId = await Playlist.findById(lecture.playlist, 'course');
        //console.log(courseId);
        const nextLecture = await Lecture.findOne({$and: [{_id: {$gt: lectureId}}, {playlist: lecture.playlist}, {fileType: "video/mp4"}]}, '_id').sort({_id: 1});
        const previousLecture = await Lecture.findOne({$and: [{_id: {$lt: lectureId}}, {playlist: lecture.playlist}, {fileType: "video/mp4"}]} , '_id').sort({_id: -1});
        if(lecture){
            res.json({lecture, nextLecture, previousLecture, courseId: courseId.course});
        } else{
            res.status(404).json({ errors: "Not Found" });
        }  
    }catch(errors){
        res.status(404).json({ errors: "Not Found" });
    }
}

module.exports.viewLectureMaterial = async (req, res) => {
    const id = req.params.id;
    const lecture = await Lecture.findById(id);
    ////console.log(lecture);
    var b64string = lecture.material;
    var buf = Buffer.from(b64string, 'base64');
    res.writeHead(200, { "Content-type": lecture.fileType});
    res.end(buf);
}


module.exports.fetchCategories = async (req, res) => {
    try{
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.searchCourseByTitle = async (req, res) => {
    const {search} = req.body;
    try{
        const courses = await Course.find({ title: { $regex: search, $options: "i"}}, "_id title category user whatYouLearn requirement description secondTitle price").populate({ path: 'user',  select: "email firstName lastName address phone userType"}).populate({ path: 'category',  select: "name"}).sort({ createdAt: -1 });
        if(courses){
            res.json(courses);
        }else{
            res.status(404).json({ errors: "Not Found" });
        }
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.searchCourseByCategory =  async (req, res) => {
    const {categoryId} = req.body;
    try{
        const courses = await Course.find({ category: categoryId}).sort({ createdAt: -1 });
        if(courses){
            res.json(courses);
        }else{
            res.status(404).json({ errors: "Not Found" });
        }
    } catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.viewLectureMaterial = async (req, res) => {
    const id = req.params.id;
    const lecture = await Lecture.findById(id);
    ////console.log(lecture);
    var b64string = lecture.material;
    var buf = Buffer.from(b64string, 'base64');
    res.writeHead(200, { "Content-type": lecture.fileType});
    res.end(buf);
}

module.exports.verifyPayment = async (req, res) => {
    const {reference, userId, courseId} = req.body;
    try{
        const response = await axios.get("https://api.paystack.co/transaction/verify/" + reference, {
            headers: {
                "Authorization": `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
            }
        });
        if(!response.data.data.status === "success"){
            res.status(404).json({"status": "failed"});
            
        }
        const instructorId = await Course.findById(courseId, "user");
        const purchaseCourse = await PurchasedCourse.create({course: courseId, student: userId, instructor: instructorId});
        res.json({"status": response.data.data.status});
    }catch(errors){
        //console.log(errors); 
        res.status(400).json(errors.message);
    }
}

module.exports.verifyPurchased = async (req, res) => {
    const {userId, courseId} = req.body;
    try{
        const isPurchased = await PurchasedCourse.findOne({$and: [{course: courseId }, {student: userId}]}, '_id');
        if(isPurchased){
            res.json({isPurchased: true});
        }else{
            res.json({isPurchased: false});
        }
    }catch(error){
        res.json({error: error.message});
    }
    
}