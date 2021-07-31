const Course = require("../models/Course");
const Lecture = require("../models/Lecture");
const User = require("../models/User");
const Category = require('../models/Category');
const Playlist = require("../models/Playlist");

module.exports.viewCourseImg = async (req, res) => {
    const id = req.params.id;
    const course = await Course.findById(id);
        console.log(course);
        var b64string = course.thumbnail.get('data');
        var buf = Buffer.from(b64string, 'base64');
        res.writeHead(200, { "Content-type": course.thumbnail.get('mimetype')});
        res.end(buf);
}

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


module.exports.viewCourse = async (req, res) => {
    const {courseId} = req.body;
    try{
        const course = await Course.findById(courseId, "_id title category user whatYouLearn requirement description secondTitle price");
        if(!course){
            res.status(404).json({ errors: "Course not found" });
        }
        const instructor = await User.findById(course.user, "email firstName lastName address phone userType");
        var modules = await getPlaylists(courseId);
        res.json({course: course, modules: modules, instructor: instructor });
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

const getPlaylists = async (courseId) => {
    try{
        var modules = [];
        let lectures;
        var playlists = await Playlist.find({course: courseId}, '_id name');
        for (let index = 0; index < playlists.length; index++) {
            var module = {
                videos: []
            };
            module['sectionTitle'] = playlists[index].name;
            module['id'] = playlists[index]._id;
            lectures = await fetchLectures(playlists[index]._id);
            module.videos = lectures;
            modules.push(module);
            //console.log(module);
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