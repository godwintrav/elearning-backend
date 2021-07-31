const { Router } = require('express');
const router = Router();
const publicController = require('../controllers/publicController');
const studentController = require('../controllers/studentController');

router.get("/courseImage/:id", publicController.viewCourseImg);
router.get("/courses", publicController.fetchAllCourses);
router.post("/course", publicController.viewCourse);

module.exports = router;