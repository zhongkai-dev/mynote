# Node.js Notes Application

A simple notes application built with Node.js and MongoDB. This application allows users to create, view, edit, and delete notes organized by categories.

## Features

- View notes by category
- Admin panel to manage notes and categories
- Mobile-friendly design
- Copy note content with one click
- Sort and filter notes
- MongoDB database integration

## Installation

1. Clone this repository
2. Install dependencies:
```
npm install
```
3. Create a `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb+srv://note:note@cluster0.hdlzqpn.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=3000
SESSION_SECRET=your_session_secret
```
4. Run the installation script to set up the database:
```
node install.js
```
5. Start the server:
```
npm start
```

## Usage

- Access the main application at: http://localhost:3000
- Access the admin panel at: http://localhost:3000/admin
- Default admin credentials:
  - Username: admin
  - Password: admin123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with username and password
- `GET /api/auth/logout` - Logout user
- `GET /api/auth/check` - Check authentication status

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category (requires authentication)
- `DELETE /api/categories/:id` - Delete a category (requires authentication)

### Notes
- `GET /api/notes?category_id=ID` or `GET /api/notes?category_name=NAME` - Get notes for a category
- `POST /api/notes` - Create a new note (requires authentication)
- `PUT /api/notes/:id` - Update a note (requires authentication)
- `DELETE /api/notes/:id` - Delete a note (requires authentication)

## Technology Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB
- **Authentication**: Express-session with MongoDB store
- **Frontend**: HTML, CSS, React (loaded from CDN) "# mynote" 
