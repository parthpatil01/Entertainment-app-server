let express = require("express")
const router = express.Router();
router.use(express.json());


let  {getBookmarkSearchResult,postMedia,deleteMedia,checkBookmarkStatus,getBookmarks } =require("../controllers/mediaController")


// Importing JWT authentication middleware
let {jwtAuth} = require("../middleware/auth")

// Applying JWT authentication middleware to all routes in this router
router.use(jwtAuth)

// Defining routes for adding new media and deleting media by ID
router.post("/addmedia", postMedia)
router.delete("/delete/:itemId", deleteMedia)
router.post('/bookmarks',checkBookmarkStatus)
router.post('/get-bookmarks',getBookmarks)
router.post('/search',getBookmarkSearchResult)







module.exports = router;