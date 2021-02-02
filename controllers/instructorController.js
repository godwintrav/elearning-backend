const Course = require('../models/Course');
const errorController = require('./errorController');
const Lecture = require('../models/Lecture');
require('dotenv/config');

let Vimeo = require('vimeo').Vimeo;
let client = new Vimeo(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.PERSONAL_ACCESS_TOKEN);
//console.log(process.env.SECRET_CODE);
let uri;
let link;

module.exports.createCourse = async (req, res) => {
    const {userId, title, whatYouLearn, requirement, description, secondTitle, category} = req.body;
    try{
        const course = await Course.create({ user: userId, title, whatYouLearn, requirement, description, secondTitle, category });
        console.log(course);
        res.json(course);
    }catch(err){
        const errors = errorController.handleCourseErrors(err);
        res.status(404).json({ errors });
    }
}

module.exports.createLecture = async (req, res) => {
    req.setTimeout(21600000);
    const {courseId, title, description} = req.body;
    let link;
    let uri;
    try {
        const isValid = errorController.checkLectureErrors(req);
        console.log(req.file.path);
        client.upload(
            req.file.path,
            {
                'name': req.body.title,
                'description': req.body.description,
                // 'privacy': {
                //     'view': 'disable'
                // },
                "upload": {
                    "size": req.file.size
                }
            },
            function(responseUri){
                console.log('Your video URI is ' + responseUri);
                uri = responseUri;
                console.log("The uri " + uri);
                client.request(responseUri + '?fields=link', function (error, body, statusCode, headers) {
                    if (error) {
                    console.log('There was an error making the request.')
                    console.log('Server reported: ' + error)
                    throw Error("error vimeo");
                    }
                    link = body.link;
                    console.log('Your video link is: ' + link);
                    saveLecture(courseId, link, uri, description, title, res);
                });
            },
            function(bytes_uploaded, bytes_total){
                var percentage = (bytes_uploaded / bytes_total * 100).toFixed(2);
                console.log(bytes_uploaded, bytes_total, percentage + "%");
            },
            function(error){
                console.log('Failed because: ' + error);
                throw Error("error vimeo");
            }
        );
    } catch(error){
        const errors = errorController.handleCreateLectureErrors(error); 
        res.status(404).json({ errors }); 
    }
}

const saveLecture = async (courseId, link, uri, description, title, res) => {
    const lecture = await Lecture.create({course: courseId, title, description, link, uri});
    return res.status(201).json(lecture);
}