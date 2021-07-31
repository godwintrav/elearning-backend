const { Router } = require('express');
const router = Router();
const adminController = require('../controllers/adminController');

router.get("/instructors", adminController.fetchAllInstructors);
router.get("/corporates", adminController.fetchCorporateInstructors);
router.get("/users", adminController.fetchUsers);
router.get("/students", adminController.fetchStudents);
router.get("/instructor/:id", adminController.fetchInstructor);
router.get("/user/:id", adminController.fetchUser);
router.get("/student/:id", adminController.fetchStudent);
router.get("/block/:id", adminController.blockUser);
router.get("/verify/:id", adminController.verifyCorporateInstructor);
router.get("/instructor/certificate/:id", adminController.viewCertificate);
router.get("/instructor/licence/:id", adminController.viewLicence);
router.post("/category", adminController.addCategory);
router.get("/categories", adminController.fetchCategories);
router.post("/register", adminController.registerAdmin);


module.exports = router;
