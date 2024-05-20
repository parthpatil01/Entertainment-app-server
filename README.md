## Entertainment App Server
This server is designed to support an entertainment application, providing functionalities related to media content and user management. It utilizes Node.js with Express.js for handling HTTP requests and MongoDB with Mongoose for data storage and manipulation.

## Getting Started
To set up the server locally, follow these steps:
1. Clone this repository to your local machine.
2. Install dependencies using npm: npm install
3. Ensure MongoDB is running locally or provide a connection URI in the environment variables.
4. Start the server: node index.js

## Technologies Used
* Node.js with Express.js for HTTP request handling, 
* MongoDB for data storage, and Mongoose for database interaction. 
* Authentication is managed with JSON Web Tokens (JWT), and 
* password hashing is implemented using bcrypt.

## Resources Used
### APIs: Tmdb api

## API Endpoints
### User Routes
* POST user/register: Register a new user.
* POST user/login: User login.
  
### Data Routes
* GET data/trending: Get trending media.
* GET data/movies: Get movies.
* GET data/tvseries: Get TV series.
* GET data/search: Search for media.
* GET data/details: Get details of a specific media item.

### Media Routes
* POST media/addmedia: Add new media
* DELETE media/delete/:itemId: Delete media by ID.
* POST media/bookmarks: Add or remove media from bookmarks.
* POST media/get-bookmarks: Get user's bookmarked media.
* POST media/search: Search for user bookmark.

## Authentication and Authorization
JWT authentication is implemented to secure routes that require user authentication.  

## Models
### Media Model
* backdrop_path: String,
* poster_path: String,
* id: Number,
* original_title: String,
* media_type: String,
* title: String,
* release_date: String,
* first_air_date:String,
* name:String,

### User Model
* email: { type: String, required: true, unique:true },
* password: { type: String, required: true },
* media: [{ type: Number }]


