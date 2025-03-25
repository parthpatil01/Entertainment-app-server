## Trendflix Server
This server powers the Trendflix entertainment application, providing a modern GraphQL API for media content and user management. Built with Node.js and Express.js, it offers efficient data fetching through GraphQL queries and mutations, with MongoDB as the data store.

#### Live link: https://trendflix.onrender.com/

## Getting Started
To set up the server locally, follow these steps:
#### 1. Clone this repository to your local machine.
    https://github.com/parthpatil01/trendflix-server.git
#### 2. Install dependencies using npm: 
    npm install
#### 3. Environment Variables: 
    
    PORT= 5000
    AUTH_TOKEN = enter your tmdb api key 
    MONGODB_URI = connection uri for mongodb 
    SECRET = secret key for jwt verification 
   
####  4. Start the server:
    node index.js

## Technologies Used
* Node.js with Express.js server
* Apollo Server for GraphQL implementation
* MongoDB with Mongoose for data persistence
* JWT for authentication
* bcrypt for password hashing
* TMDB API for media data

## GraphQL API 

### Queries
```
  trending {
    id
    title
    name
    poster_path
    media_type
  }
  
  movies(first: 10, after: "cursor") {
    edges {
      node {
        id
        title
        poster_path
      }
      cursor
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
  
  tvSeries(first: 10) {
    edges {
      node {
        id
        name
        first_air_date
      }
    }
  }
  
  search(q: "query", type: "movie|tv") {
    id
    title
    name
  }
  
  details(itemId: Int!, type: "movie|tv") {
    detail {
      title
      overview
      genres {
        name
      }
    }
    cast {
      cast {
        name
      }
    }
  }
  
  bookmarks {
    id
    title
    media_type
  }
  
  bookmarkStatus(itemId: Int!) {
    isBookmarked
  }
}
```
### Mutations
```
mutation {
  registerUser(email: "user@example.com", password: "secure123") {
    message
  }
  
  loginUser(email: "user@example.com", password: "secure123") {
    token
    message
  }
  
  postMedia(item: {
    id: 123,
    title: "Movie Title",
    media_type: "movie"
  }, location: 175) {
    message
  }
  
  deleteMedia(itemId: 123) {
    message
  }
}
```
## Authentication and Authorization
JWT authentication is implemented to secure routes that require user authentication.  

## Migration Notes

This server has been migrated from REST to GraphQL, offering:
* More efficient data fetching
* Strong typing system
* Flexible queries with exactly the data needed
* Better performance with features like batching and caching

## Resources Used
#### TMDB API: https://www.themoviedb.org/
#### Deployment Platform: Render https://render.com/
