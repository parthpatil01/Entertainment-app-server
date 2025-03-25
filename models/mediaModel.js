
// models/mediaModel.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    backdrop_path: String,
    poster_path: String,
    id: Number,
    original_title: String,
    media_type: String,
    title: String,
    release_date: String,
    first_air_date:String,
    name:String,
});

const Media = mongoose.model('media', mediaSchema);


module.exports = Media;
