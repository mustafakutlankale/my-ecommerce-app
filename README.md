# CENG495 CLOUD COMPUTING E-Commerce Application

This e-commerce application was developed for the CENG 495 Cloud Computing course at Middle East Technical University. It's built using Next.js, MongoDB Atlas, and deployed on Vercel.

## Design Decisions

### Technology Stack

- **Frontend**: Next.js with App Router
- **Backend**: Next.js API Routes
- **Database**: MongoDB Atlas (NoSQL)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS

I chose Next.js for this project because it offers a great balance between frontend and backend capabilities, with built-in API routes that make it easy to create a full-stack application without needing a separate backend server. The App Router provides a modern, efficient way to handle routing in the application.

### Database Schema

I designed the database with two main collections to keep it minimal while maintaining the necessary relationships:

1. **Users Collection**: Stores user data, including their ratings and reviews.
2. **Items Collection**: Stores item data, including attributes specific to each category.

This design allows for efficient querying and reduces the need for complex joins or lookups. It also makes it easy to display and update user's ratings and reviews.

### Authentication

I implemented authentication using NextAuth.js with a credentials provider. This allows users to sign in with a username and password. The application supports two roles:

1. **Admin**: Can add and remove items and users
2. **Regular User**: Can browse items, rate them, and write reviews

## How to Use

### Login Credentials

- **Admin User**:
  - Username: admin
  - Password: admin123

- **Regular User**:
  - Username: user1
  - Password: user123

### Features

- **Home Page**: Browse all items or filter by category
- **Item Detail**: View detailed information about an item
- **Rating & Reviews**: Authenticated users can rate items and write reviews
- **Admin Dashboard**: Admin users can manage items and users
- **User Profile**: View your ratings and reviews


## Vercel Deployment URL

[https://my-ecommerce-app-blue.vercel.app](https://my-ecommerce-app-blue.vercel.app)

## Populating the Database

Before submitting, I've populated the database with:
- 8 items
- 3 users (including an admin)
- Multiple ratings and reviews