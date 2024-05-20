## Entertainment App Server
This server is designed to support an entertainment application, providing functionalities related to media content and user management. It utilizes Node.js with Express.js for handling HTTP requests and MongoDB with Mongoose for data storage and manipulation.

#### Live link: https://entertainment-app-9jvl.onrender.com/

## Getting Started
To set up the server locally, follow these steps:
1. Clone this repository to your local machine.
2. Install dependencies using npm: npm install
#### Environment Variables
    Before running the app, make sure to set up the necessary environment variables.
    Create a .env file in the root of your project directory and add the required variables.

     PORT= 5000
     AUTH_TOKEN = enter your tmdb api key 
     MONGODB_URI = connection uri for mongodb 
     SECRET = secret key for jwt verification 
   
3. Start the server:
#### 
    node index.js

## Technologies Used
* Node.js with Express.js for HTTP request handling, 
* MongoDB for data storage, and Mongoose for database interaction. 
* Authentication is managed with JSON Web Tokens (JWT), and 
* password hashing is implemented using bcrypt.

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

## Resources Used
#### TMDB API: https://www.themoviedb.org/
#### Deployment Platform: Render https://render.com/

