const Course = require("../models/Course");
const Lecture = require("../models/Lecture");
const User = require("../models/User");
const Category = require('../models/Category');
const Playlist = require("../models/Playlist");
const PurchasedCourse = require("../models/PurchasedCourse");
const Instructor = require('../models/Instructor');
const axios = require('axios');
const errorController = require('./errorController');
const { getVideoDurationInSeconds } = require('get-video-duration');

let Vimeo = require('vimeo').Vimeo;
let client = new Vimeo(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.PERSONAL_ACCESS_TOKEN);
////console.log(process.env.SECRET_CODE);
let uri;
let link;

module.exports.createCourse = async (req, res) => {
    const {userId, title, whatYouLearn, requirement, description, secondTitle, category, price} = req.body;
    try{
        const course = await Course.create({ user: userId, title, whatYouLearn, requirement, description, secondTitle, category, thumbnail: {
            data: req.file.buffer.toString('base64'),
            mimetype: req.file.mimetype
        }, price: price });
        res.status(201).json({user: course.user, title: course.title, whatYouLearn: course.whatYouLearn, description: course.description, secondTitle: course.secondTitle, category: course.category, _id: course._id});
    }catch(err){
        const errors = errorController.handleCourseErrors(err);
        res.status(404).json({ errors });
    }
}

module.exports.createPlaylist = async (req, res) => {
    const {courseId, name} = req.body;
    //console.log(req.body)
    try{
        const courseName = await Course.findById(courseId, "title");
        const playlist = await Playlist.create({ course: courseId, name: name });
        var modules = [];
        modules = await getPlaylists(courseId);
        res.status(201).json({modules, courseName});
    }catch(err){
        ////console.log(err);
        const errors = errorController.handlePlaylistErrors(err);
        res.status(404).json({ errors });
    }
}

module.exports.createLecture = async (req, res) => {
    req.setTimeout(21600000);
    const {playlistId, title} = req.body;
    const fileType = req.file.mimetype
    let uri;
    let duration;
    try {
        const isValid = errorController.checkLectureErrors(req);
        duration = await getVideoDurationInSeconds(req.file.path);
        //console.log(duration);
        if(duration >= 1200){
            return res.status(400).json("Duration must not be more than 20 minutes"); 
        }
         client.upload(
            req.file.path,
            {
                'name': req.body.title,
                'description': '',
                'privacy': {
                    'view': 'disable'
                },
                "upload": {
                    "size": req.file.size
                }
            },
            function(responseUri){
                //console.log('Your video URI is ' + responseUri);
                uri = responseUri;
                //console.log("The uri " + uri);
                saveLecture(playlistId, uri, title, duration, fileType).then(data => res.json(data));
                getVideoLink(responseUri);
            },
            function(bytes_uploaded, bytes_total){
                var percentage = (bytes_uploaded / bytes_total * 100).toFixed(2);
                //console.log(bytes_uploaded, bytes_total, percentage + "%");
            },
            function(error){
                //console.log('Failed because: ' + error);
                throw Error("error vimeo");
            }
        );
    } catch(error){
        const errors = errorController.handleCreateLectureErrors(error); 
        res.status(404).json({ errors }); 
    }
}

module.exports.createMaterial = async (req, res) => {
    try{
        const {playlistId, title} = req.body;
        ////console.log(req.file.buffer);
        const lecture = await Lecture.create({playlist: playlistId, title, material: req.file.buffer.toString('base64'), fileType: req.file.mimetype});
        const playlist = await Playlist.findById(playlistId).populate({ path: 'course',  select: "title"});
        //console.log(playlist);
        var modules = await getPlaylists(playlist.course);
        res.json({modules, courseName: playlist.course[0].title});
    }catch(error){
        //console.log(error);
        res.status(500).json({error: error.message}); 
    }
}

module.exports.updateCV = async (req, res) => {
    const {userId} = req.body;
    try{
        const updatedCV = await Instructor.findOneAndUpdate({user: userId}, {cv: {
            data: req.file.buffer.toString('base64'),
            mimetype: req.file.mimetype,
        }});
        res.json(updateCV);
    }catch(errors){
        res.status(400).json({ errors: errors.message });
    }
}


const getVideoLink = async (uri) => {
    let link;
    client.request(uri + '?fields=link', function (error, body, statusCode, headers) {
        if (error) {
        //console.log('There was an error making the request.')
        //console.log('Server reported: ' + error)
        throw Error("error vimeo");
        }
        link = body.link;
        //console.log('Your video link is: ' + link);
        updateVideoLink(link, uri);
    });
}

const updateVideoLink = async (link, uri) => {
    try{
        const updatedVideo = await Lecture.findOneAndUpdate({uri: uri}, {link});
        //console.log(updatedVideo);
    }catch(error){
        //console.log(error.message);
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



const saveLecture = async (playlistId, uri, title, duration, fileType) => {
    try{
        const lecture = await Lecture.create({playlist: playlistId, title, uri, duration, fileType});
        const playlist = await Playlist.findById(playlistId).populate({ path: 'course',  select: "title"});
        var modules = await getPlaylists(playlist.course);
        return {modules, courseName: playlist.course[0].title};
    }catch(error){
        //console.log(error.message);
        throw Error(error.message);
    }
}

module.exports.fetchPlaylists = async (req, res) => {
    const courseId = req.params.id;
    try{
        const courseName = await Course.findById(courseId, "title");
        var modules = await getPlaylists(courseId);
        //console.log("modules", modules);
        //console.log("courseName", courseName);
        res.json({modules, courseName: courseName.title});
    }catch(errors){
        //console.log(errors);
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.fetchInstructorCourses = async (req, res) => {
    const instructorId = req.params.id;
    try{
        const courses = await Course.find({ user: instructorId }, "_id title category user whatYouLearn requirement description secondTitle price");
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
        const course = await Course.findById(courseId, "_id title category user whatYouLearn requirement description secondTitle price");
        if(!course){
            res.status(404).json({ errors: "Course not found" });
        }
        const instructor = await User.findById(course.user);
        var modules = await getPlaylists(courseId);
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
        //console.log("modules", modules);
        //console.log("courseName", courseName);
        res.json({modules, courseName: courseName.title});
    }catch(errors){
        //console.log(errors);
        res.status(404).json({ errors: errors.message });
    }
}

const getPlaylists = async (courseId) => {
    try{
        var modules = [];
        var playlists = await Playlist.find({course: courseId}, '_id name');
        for (let index = 0; index < playlists.length; index++) {
            var module = {
                videos: []
            };
            module['sectionTitle'] = playlists[index].name;
            module['id'] = playlists[index]._id;
            const lectures = await fetchLectures(playlists[index]._id);
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
        const lectures = await Lecture.find({playlist: id}, '_id title description link uri duration fileType');
        return lectures;
    }catch(err){
        throw Error(err.message);
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

module.exports.fetchCategories = async (req, res) => {
    try{
        //console.log("I'm here");
        const categories = await Category.find().sort({ createdAt: -1 });
        res.json(categories);
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.deleteCourse = async (req, res) => {
    const  courseId = req.params.id;

    try{
        const course = await Course.findById(courseId);
        if(!course){
            res.status(404).json({ errors: "Not Found" });
        }
        const modules = await getPlaylists(courseId);
        for (let i = 0; i < modules.length; i++) {
            for (let j = 0; j < modules[i].videos.length; j++) {
                await removeLecture(modules[i].videos[j]._id);   
            }  
        }
        await deletePlaylists(courseId);
        await PurchasedCourse.deleteMany({course: courseId});
        const deletedCourse = await Course.findByIdAndDelete(courseId);
        res.json({status: "success"});
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

const deletePlaylists = async (courseId) => {
    try{
        await Playlist.deleteMany({ course: courseId });
        return true;
    }catch(errors){
        throw Error(errors.message);
    }
}


module.exports.deletePlaylist = async (req, res) => {
    const playlistId = req.params.id;
    try{
        const playlist = await Playlist.findById(playlistId).populate({ path: 'course',  select: "title"});
        if(!playlist){
            res.status(404).json({ errors: "Not Found" });
        }
        const videos = await Lecture.find({ playlist: playlistId });
        for (let index = 0; index < videos.length; index++) {
            await removeLecture(videos[index]._id);
            
        }
        const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);
        var modules = await getPlaylists(playlist.course);
        res.json({modules, courseName: playlist.course[0].title});
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

module.exports.deleteLecture = async (req, res) => {
    const lectureId  = req.params.id;

    try{
        //console.log(lectureId);
        const lecture = await Lecture.findById(lectureId);
        const courseInfo = await Playlist.findById(lecture.playlist, "_id").populate({ path: 'course',  select: "title"});
        //console.log(lecture);
        if(lecture.fileType === "video/mp4"){
            const video_id = lecture.uri.substr(8);
            const response = await axios.delete("https://api.vimeo.com/videos/" + video_id, {
                headers: {
                    "Authorization": `bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
                    "Accept": "application/vnd.vimeo.*+json;version=3.4"
                }
            });
        }
        //console.log({modules, courseName: courseInfo.course[0].title});
        const deletedLecture = await Lecture.findByIdAndDelete(lectureId);
        var modules = await getPlaylists(courseInfo.course[0]._id);
        res.json({modules, courseName: courseInfo.course[0].title});
    }catch(errors){
        res.status(404).json({ errors: errors.message });
    }
}

const removeLecture = async (lectureId) => {
    try{
        //console.log(lectureId);
        const lecture = await Lecture.findById(lectureId);
        ////console.log(lecture);
        if(lecture.fileType === "video/mp4"){
            const video_id = lecture.uri.substr(8);
            const response = await axios.delete("https://api.vimeo.com/videos/" + video_id, {
                headers: {
                    "Authorization": `bearer ${process.env.PERSONAL_ACCESS_TOKEN}`,
                    "Accept": "application/vnd.vimeo.*+json;version=3.4"
                }
            });
            //console.log(response);
        }
        const deletedLecture = await Lecture.findByIdAndDelete(lectureId);
        return true;
    }catch(errors){
        throw Error(errors.message);
    }
}

module.exports.fetchInstructor = async (req, res) => {
    const id = req.params.id;
    try{
        const instructor = await Instructor.findOne({user: id}, "_id expertise experience companyName instructorType").populate({ path: 'user',  select: "email firstName lastName address phone userType"});
        if(!instructor){
            res.status(404).json({ error: "User not found" });
        }
        res.json( instructor );
    }catch(errors){
        console.log(errors);
        res.status(404).json({ error: errors.message });
    }
}

