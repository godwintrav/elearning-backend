const { Router } = require('express');
const router = Router();
const instructorController = require('../controllers/instructorController');
const multer = require('multer');
var storage = multer.diskStorage({});
const uploads = multer({
    limits: {
        fileSize: 300000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.toLowerCase().match(/\.(mp4)$/))
        return cb(new Error('Invalid file format'))
        cb(undefined, true)
    },
    storage: storage
});

router.post("/createCourse", instructorController.createCourse);
router.post("/lecture", uploads.single('video'), instructorController.createLecture, (err, req, res, next) => {
    console.log(err);
    res.status(400).send({errors: err.message});
});

module.exports = router;