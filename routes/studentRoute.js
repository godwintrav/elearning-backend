const { Router } = require('express');
const router = Router();
const studentController = require('../controllers/studentController');

router.get("/courses", studentController.fetchAllCourses);
router.get("/myCourses/:id", studentController.studentPurchasedCourses);
router.get("/courses/:id", studentController.fetchInstructorCourses);
router.post("/course", studentController.viewCourse);
router.get("/lecture/:id", studentController.viewLecture);
router.post("/search", studentController.searchCourseByTitle);
router.post("/verifyPayment", studentController.verifyPayment);
router.post("/verifyPurchase", studentController.verifyPurchased);
router.get("/material/:id", studentController.viewLectureMaterial);


module.exports = router;