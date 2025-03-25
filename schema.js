// schema.js
const { gql } = require('graphql-tag');

const typeDefs = gql`
  type User {
    email: String!
    password: String!
    media: [Int]
  }

  type Media {
    backdrop_path: String
    poster_path: String
    id: Int!
    original_title: String
    media_type: String
    title: String
    release_date: String
    first_air_date: String
    name: String
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String
  }

  type MediaEdge {
    node: Media!
    cursor: String!
  }

  type MediaConnection {
    edges: [MediaEdge!]!
    pageInfo: PageInfo!
    totalCount: Int!
  }

  type Query {
    trending: [Media]
    movies(first: Int, after: String): MediaConnection  # Updated for cursor pagination
    tvSeries(first: Int, after: String): MediaConnection  # Updated for cursor pagination
    search(q: String, type: String): [Media]
    details(itemId: Int!, type: String!): MediaDetails
    bookmarks(search: String): [Media] # Protected
    bookmarkStatus(itemId: Int!): BookmarkStatus # Protected
  }

  type MediaDetails {
    detail: Media
    cast: Cast
  }

  type Cast {
    cast: [CastMember]
    crew: [CrewMember]
  }

  type CastMember {
    name: String
    character: String
  }

  type CrewMember {
    name: String
    job: String
  }

  type BookmarkStatus {
    message: String
    isBookmarked: Boolean
  }

  type Mutation {
    registerUser(email: String!, password: String!): UserResponse # Public
    loginUser(email: String!, password: String!): LoginResponse # Public
    postMedia(item: MediaInput!, location: Int!): MediaResponse # Protected
    deleteMedia(itemId: Int!): MediaResponse # Protected
  }

  input MediaInput {
    backdrop_path: String
    poster_path: String
    id: Int!
    original_title: String
    media_type: String
    title: String
    release_date: String
    first_air_date: String
    name: String
  }

  type UserResponse {
    message: String
  }

  type LoginResponse {
    token: String
    message: String
    data: UserData
  }

  type UserData {
    useremail: String
  }

  type MediaResponse {
    message: String
  }
`;

module.exports = typeDefs;