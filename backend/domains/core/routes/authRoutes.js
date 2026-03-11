const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validate = require("../middleware/validateMiddleware");
const authValidation = require("../validations/authValidation");
const authMiddleware = require("../middleware/authMiddleware");

// Public routes
router.post("/login", validate(authValidation.login), authController.login);

// Protected routes
router.use(authMiddleware);
router.post("/logout", authController.logout);
router.get("/user", authController.getCurrentUser);

module.exports = router;
