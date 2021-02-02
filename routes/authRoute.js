const { Router } = require('express');
const multer = require('multer');
const uploads = multer({
    limits: {
        fileSize: 3000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.toLowerCase().match(/\.(pdf)$/))
        return cb(new Error('Invalid file format'))
        cb(undefined, true)
    }
})

const authController = require('../controllers/authController');

const router = Router();
var uploadFields = uploads.fields([
    {name: 'cv'},
    {name: 'trainingLicence'},
    {name: 'incorporationCertificate'},
]);

router.post("/registerStudent", authController.student_signup_post);
router.post("/registerInstructor" , uploadFields, authController.instructor_signup_post, (err, req, res, next) => {
    console.log(err);
    res.status(400).send({errors: err.message});
});
router.post("/login", authController.login_post);
router.get("/:verifyId", authController.verify_email_get);
router.post("/resendLink", authController.resendVerificationLink);
router.get("/pdf/:id", authController.pdf);
router.post("/getCurrentUser", authController.getCurrentUser);

module.exports = router;