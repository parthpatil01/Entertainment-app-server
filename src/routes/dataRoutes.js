let express = require("express")
const router = express.Router();
router.use(express.json());

let  {getTrending,getMovies,getTvSeries,getSearchResult,getDetails } =require("../controllers/mediaController")


router.get("/trending", getTrending)
router.get("/movies", getMovies)
router.get("/tvseries", getTvSeries)
router.get("/search",getSearchResult)
router.get("/details",getDetails)


module.exports = router;
