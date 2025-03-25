// resolvers.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/userModel');
const Media = require('./models/mediaModel');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();
const JWT_SECRET = process.env.SECRET;

const options = {
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${process.env.AUTH_TOKEN}`,
  },
};

const resolvers = {
  Query: {
    trending: async () => {
      const [trendingMoviesResponse, trendingSeriesResponse] = await Promise.all([
        axios.get('https://api.themoviedb.org/3/trending/movie/day?language=en-US', { ...options, timeout: 10000 }),
        axios.get('https://api.themoviedb.org/3/trending/tv/day?language=en-US', { ...options, timeout: 10000 }),
      ]);

      let trendingMedia = [];
      if (trendingMoviesResponse && trendingSeriesResponse) {
        trendingMedia = [...trendingMoviesResponse.data.results, ...trendingSeriesResponse.data.results];
      }

      return trendingMedia;
    },
    movies: async (_, { first = 20, after = null }) => {
      try {
        // Decode the cursor to get the page number
        const afterPage = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : 1;
        const currentPage = after ? afterPage + 1 : 1;
        
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/movie?language=en-US&page=${currentPage}`,
          { ...options, timeout: 10000 }
        );

        const movies = response.data.results;
        const totalPages = response.data.total_pages;
        const totalCount = response.data.total_results;

        const edges = movies.map(movie => ({
          node: {
            id: movie.id,
            title: movie.title,
            backdrop_path: movie.backdrop_path,
            poster_path: movie.poster_path,
            release_date: movie.release_date,
            media_type: 'movie'
          },
          cursor: Buffer.from(currentPage.toString()).toString('base64')
        }));

        const hasNextPage = currentPage < totalPages;

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
          },
          totalCount
        };
      } catch (error) {
        throw new Error('Failed to fetch movies');
      }
    },
    
    tvSeries: async (_, { first = 20, after = null }) => {
      try {
        const afterPage = after ? parseInt(Buffer.from(after, 'base64').toString('ascii')) : 1;
        const currentPage = after ? afterPage + 1 : 1;
        
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/tv?language=en-US&page=${currentPage}`,
          { ...options, timeout: 10000 }
        );

        const tvSeries = response.data.results;
        const totalPages = response.data.total_pages;
        const totalCount = response.data.total_results;

        const edges = tvSeries.map(series => ({
          node: {
            id: series.id,
            name: series.name,
            backdrop_path: series.backdrop_path,
            poster_path: series.poster_path,
            first_air_date: series.first_air_date,
            media_type: 'tv'
          },
          cursor: Buffer.from(currentPage.toString()).toString('base64')
        }));

        const hasNextPage = currentPage < totalPages;

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null
          },
          totalCount
        };
      } catch (error) {
        throw new Error('Failed to fetch TV series');
      }
    },
    search: async (_, { q, type }) => {
      let allResults = [];
      let currentPage = 1;
      while (currentPage <= 3) {
        const results = await axios.get(`https://api.themoviedb.org/3/search/multi?query=${q}&include_adult=false&language=en-US&page=${currentPage}`, { ...options, timeout: 10000 });
        if (results.data.results.length === 0) break;
        allResults.push(...results.data.results);
        currentPage++;
      }

      let filteredData = allResults;
      if (type === 'movie') {
        filteredData = allResults.filter(item =>
          item.media_type === 'movie' && (item.title || item.name || item.original_title).toLowerCase().includes(q.toLowerCase())
        );
      } else if (type === 'tv') {
        filteredData = allResults.filter(item =>
          item.media_type === 'tv' && (item.title || item.name || item.original_title).toLowerCase().includes(q.toLowerCase())
        );
      }

      return filteredData;
    },
    details: async (_, { itemId, type }) => {
      const [detailResponse, creditResponse] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/${type}/${itemId}?language=en-US`, { ...options, timeout: 10000 }),
        axios.get(`https://api.themoviedb.org/3/${type}/${itemId}/credits?language=en-US`, { ...options, timeout: 10000 }),
      ]);

      const detail = detailResponse.data;
      let cast = creditResponse.data.cast;
      const maxCastCrewEntries = 10;
      if (cast.length > maxCastCrewEntries) {
        cast = cast.slice(0, maxCastCrewEntries);
      }

      const directors = creditResponse.data.crew.filter(member => member.job === 'Director');
      const combinedCast = { cast: cast, crew: directors };

      return { detail, cast: combinedCast };
    },
    bookmarks: async (_, { search }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      
      // Find the user
      const user = await User.findOne({ email: context.user.email });
      if (!user) throw new Error('User not found');
      
      // Get all bookmarked media IDs
      const mediaIds = user.media;
      
      // Base query - only include bookmarked items
      const query = { id: { $in: mediaIds } };
      
      // If search parameter exists, add search conditions
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },  // Case-insensitive search on title
          { name: { $regex: search, $options: 'i' } }   // Case-insensitive search on name
        ];
      }
      
      return Media.find(query);
    },
    bookmarkStatus: async (_, { itemId }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const user = await User.findOne({ email: context.user.email });
      if (!user) throw new Error('User not found');
      const isBookmarked = user.media.includes(itemId);
      return { message: isBookmarked ? "Media is bookmarked" : "Media is not bookmarked", isBookmarked };
    },
  },
  Mutation: {
    registerUser: async (_, { email, password }) => {
      email = email.toLowerCase();
      const existingUser = await User.findOne({ email });
      if (existingUser) throw new Error('User already exists, Sign in!');

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({ email, password: hashedPassword });
      await newUser.save();

      return { message: 'Registration successful, now you can login!' };
    },
    loginUser: async (_, { email, password }) => {
      email = email.toLowerCase();
      const user = await User.findOne({ email });
      if (!user) throw new Error('User not found');

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) throw new Error('Invalid password');
      console.log(JWT_SECRET);
      const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET);
      return { token, message: "Successfully logged in!", data: { useremail: user.email } };
    },
    postMedia: async (_, { item, location }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      const user = await User.findOne({ email: context.user.email });
      if (!user) throw new Error('User not found');

      if (location === 175) {
        item.media_type = 'movie';
      } else if (location === 174) {
        item.media_type = 'tv';
      }

      if (!user.media.includes(item.id)) {
        await User.updateOne({ email: context.user.email }, { $push: { media: item.id } });
        const existingMedia = await Media.findOne({ id: item.id });
        if (!existingMedia) {
          const media = new Media(item);
          await media.save();
        }
        return { message: "Bookmarked successfully!" };
      } else {
        return { message: "Already Bookmarked!" };
      }
    },
    deleteMedia: async (_, { itemId }, context) => {
      if (!context.user) throw new Error('Unauthorized');
      await User.updateOne({ email: context.user.email }, { $pull: { media: itemId } });
      await Media.findOneAndDelete({ id: itemId });
      return { message: "Media deleted successfully" };
    },
  },
};

module.exports = resolvers;