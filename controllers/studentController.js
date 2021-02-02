const Course = require("../models/Course");
const Lecture = require("../models/Lecture");
const User = require("../models/User");

module.exports.fetchAllCourses = async (req, res) => {
    try{
        const courses = await Course.find().sort({ createdAt: -1 });
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
        const courses = await Course.find({ user: instructorId });
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
    const courseId = req.params.id;
    try{
        const course = await Course.findById(courseId);
        const lectures = await Lecture.find({course: courseId});
        const instructor = await User.findById(course.user);
        res.json({course: course, lectures: lectures, instructor: instructor });
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.viewLecture = async (req, res) => {
    const lectureId = req.params.id;
    try{
        const lecture = await Lecture.findById(lectureId);
        if(lecture){
            res.json(lecture);
        } else{
            res.status(404).json({ errors: "Not Found" });
        }  
    }catch(errors){
        res.status(404).json({ errors: "Not Found" });
    }
}

module.exports.searchCourseByTitle = async (req, res) => {
    const {search} = req.body;
    try{
        const courses = await Course.find({ title: { $regex: search, $options: "i"}}).sort({ createdAt: -1 });
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