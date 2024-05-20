const mongoose = require('mongoose');
let Media = require("../models/mediaModel");
let User = require('../models/userModel');
const axios = require('axios');


const options = {
    headers: {
        accept: 'application/json',
        Authorization:
            `Bearer ${process.env.AUTH_TOKEN}`,
    },
};


const getTrending = async (req, res) => {

    try {
        const [trendingMoviesResponse, trendingSeriesResponse] = await Promise.all([
            axios.get('https://api.themoviedb.org/3/trending/movie/day?language=en-US', { ...options, timeout: 10000 }),
            axios.get('https://api.themoviedb.org/3/trending/tv/day?language=en-US', { ...options, timeout: 10000 })
        ]);

        let trendingMedia = [];
        if (trendingMoviesResponse && trendingSeriesResponse) {
            trendingMedia = [...trendingMoviesResponse.data.results, ...trendingSeriesResponse.data.results]
        }

        if (trendingMedia.length > 0) {
            // Send the fetched movies and series as a response
            res.status(200).json(trendingMedia);
        } else {
            // No media fetched
            res.status(500).json({ error: 'Error fetching trending media' });
        }
    } catch (error) {
        // If there's an error, send an error response
        console.error('Error fetching trending media:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }

};

const getDetails = async (req, res) => {


    const itemId = req.query.itemId;
    const type = req.query.type;

    try {
        // Fetch detail and credits concurrently
        const [detailResponse, creditResponse] = await Promise.all([
            axios.get(`https://api.themoviedb.org/3/${type}/${itemId}?language=en-US`, { ...options, timeout: 10000 }),
            axios.get(`https://api.themoviedb.org/3/${type}/${itemId}/credits?language=en-US`, { ...options, timeout: 10000 })
        ]);


        const detail = detailResponse.data;

        const maxCastCrewEntries = 10; // Maximum entries to keep
        let cast = creditResponse.data.cast;

        // Limit the number of entries in cast array
        if (cast.length > maxCastCrewEntries) {
            cast = cast.slice(0, maxCastCrewEntries);
        }

        const directors = creditResponse.data.crew.filter(member => member.job === 'Director');

        // Combine directors into the cast object
        const combinedCast = { cast: cast, crew: directors };

        // Send the fetched details and cast as a response
        res.status(200).json({ detail, cast: combinedCast });
    } catch (error) {
        console.error('Error fetching media details:', error.message);
        res.status(500).json({ error: 'Internal server error' });
    }


};

const getMovies = async (req, res) => {
    try {

        const page = req.query.page
        // Query the database to fetch all saved movies
        const moviesResponse = await axios.get(`https://api.themoviedb.org/3/discover/movie?language=en-US&page=${page}`, { ...options, timeout: 10000 });
        const movies = moviesResponse.data.results;
        // Send the fetched movies as a response
        res.status(200).json(movies);
    } catch (error) {
        // If there's an error, send an error response
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getTvSeries = async (req, res) => {
    try {
        // Query the database to fetch all saved movies
        const page = req.query.page

        const tvSeriesResponse = await axios.get(`https://api.themoviedb.org/3/discover/tv?language=en-US&page=${page}`, { ...options, timeout: 10000 });
        const tvseries = tvSeriesResponse.data.results;
        // Send the fetched movies as a response
        res.status(200).json(tvseries);
    } catch (error) {
        // If there's an error, send an error response
        console.error('Error fetching movies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getSearchResult = async (req, res) => {
    try {
        const query = req.query.q;
        const type = req.query.type;
        let allResults = [];

        // Define a function to fetch results from a specific page
        const fetchResultsFromPage = async (page) => {
            const searchResult = await axios.get(`https://api.themoviedb.org/3/search/multi?query=${query}&include_adult=false&language=en-US&page=${page}`, { ...options, timeout: 10000 });
            return searchResult.data.results;
        };

        // Fetch results from each page sequentially until no more results are available
        let currentPage = 1;
        while (currentPage <= 3) {
            const results = await fetchResultsFromPage(currentPage);
            if (results.length === 0) break; // No more results, exit loop
            allResults.push(...results);
            currentPage++;
        }

        // Filter and send the appropriate results based on the type
        let filteredData = allResults;
        if (type === 'movie') {
            filteredData = allResults.filter(item =>
                item.media_type === 'movie' && (item.title || item.name || item.original_title).toLowerCase().includes(query.toLowerCase())
            );
        } else if (type === 'tv') {
            filteredData = allResults.filter(item =>
                item.media_type === 'tv' && (item.title || item.name || item.original_title).toLowerCase().includes(query.toLowerCase())
            );
        }

        res.json(filteredData);
    } catch (error) {
        console.error('Error handling search request:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }

}

const getBookmarkSearchResult = async (req, res) => {

    try {

        const query = req.query.q;
        const email = req.body.email;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const mediaIds = user.media;

        const data = await Media.find({ id: { $in: mediaIds } });

        // // Filter the data based on the query and type
        const filteredData = data.filter(item =>
            (item.title || item.name || item.original_title).toLowerCase().includes(query.toLowerCase())
        );

        res.json(filteredData)


    } catch (error) {
        console.error('Error handling search request:', error);
        res.status(500).json({ error: 'An internal server error occurred' });
    }
}

const postMedia = async (req, res) => {

    try {

        const { item, email, location } = req.body;
        const itemId = item.id;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Determine media_type based on location
       
        if (location === 175) {
            item.media_type = 'movie';
        } else if (location === 174) {
            item.media_type = 'tv';
        }

        if (!user.media.includes(itemId)) {
            // Associate the existing media with the user

            await User.updateOne(
                { email },
                { $push: { media: itemId } },
                { upsert: false, new: true } // Combined options into a single object
            );

            const existingMedia = await Media.findOne({ 'id': itemId });

            if (!existingMedia) {
                // Create a new media item
                const media = new Media(item);
                await media.save();
                console.log('New media item saved successfully');
            }

            res.status(201).json({
                message: "Bookmarked successfully!",
            });
        } else {
            res.status(201).json({
                message: "Already Bookmarked!",
            });
        }


    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
};

const getBookmarks = async (req, res) => {
    const { email } = req.body;// Assuming userId and mediaId are passed in the request parameters
    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const mediaIds = user.media;

    const data = await Media.find({ id: { $in: mediaIds } });

    res.status(200).json(data);
}


const checkBookmarkStatus = async (req, res) => {
    try {

        const { email, itemId } = req.body;// Assuming userId and mediaId are passed in the request parameters
        const user = await User.findOne({ email });


        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if the media ID exists in the user's bookmarked movies array
        const isBookmarked = user.media.includes(itemId);

        res.status(200).json({
            message: isBookmarked ? "Media is bookmarked" : "Media is not bookmarked",
            isBookmarked,
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({
            status: "Failed",
            message: error.message,
        });
    }
};




const deleteMedia = async (req, res) => {
    try {


        // Assuming req.params.id contains the ID of the media to be deleted
        const mediaId = req.params.itemId;
        // Remove the media ID from the user's movies array
        await User.updateOne(
            { email: req.body.email },
            { $pull: { media: mediaId } }
        );

        await Media.findOneAndDelete({ id: mediaId });

        res.status(200).json({ message: "Media deleted successfully" });
    } catch (error) {
        console.log(error);
        res.status(400).json({ status: "Failed", message: error.message });
    }
};




module.exports = { getTrending, getMovies, getTvSeries, getSearchResult, getDetails, getBookmarkSearchResult, postMedia, getBookmarks, checkBookmarkStatus, deleteMedia };