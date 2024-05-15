let express = require("express")
const router = express.Router();
router.use(express.json());


let { registerUser, loginUser } = require("../controllers/userController")

// Defining routes for user registration, login, fetching user by email, and deleting user by ID
router.post("/register", registerUser)
router.post("/login", loginUser)




module.exports = router;