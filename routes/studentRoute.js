const { Router } = require('express');
const router = Router();
const studentController = require('../controllers/studentController');

router.get("/courses", studentController.fetchAllCourses);
router.get("/courses/:id", studentController.fetchInstructorCourses);
router.get("/course/:id", studentController.viewCourse);
router.get("/lecture/:id", studentController.viewLecture);
router.post("/search", studentController.searchCourseByTitle);

module.exports = router;