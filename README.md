# ChitChat

## Overview

ChitChat is a real-time messaging app where you can send messages to your friends in 1-on-1 chats, search through your texts, edit and delete your messages, react with emojis, and sign out and sign in securely.

---

## How to run ChitChat locally

1. Install Node.js on your device: [https://nodejs.org/en](https://nodejs.org/en) 

2. Clone the repository: `git clone https://github.com/tn82596/ChitChat.git`
---
### Frontend Setup

In the project directory, you can run:

### `npm i`

This downloads all dependencies needed that are declared in the package.json.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

### Backend Setup

In a separate terminal, navigate to the backend directory (`cd backend`). You can run:

### `npm i`

This downloads all dependencies for the backend that are declared in the package.json

### `code .env`

Makes your .env file. This file should be formatted like so: 
> MONGO_URI=your_mongodb_connection_string \
> JWT_SECRET=your_jwt_secret

### `How to Obtain the MongoDB URI:`
Create a MongoDB Cluster (if not already created):

Visit MongoDB Atlas.
Sign in or create an account.
Follow the steps to create a free cluster.

Once the cluster is set up, click "Connect" for your cluster in the Atlas dashboard.
Select "Connect your application".
Copy the connection string provided (e.g., mongodb+srv://username:password@cluster0.mongodb.net/dbname?retryWrites=true&w=majority).

Replace username and password with your MongoDB credentials.
Replace dbname with the name of your database.

### `How to Obtain the jwt_secret:`
 
Generate any random string and paste it in.


### `node server.js`

Sets up web server to process requests from the web browser.

---

## Contributors

* [Ashley Wu](https://github.com/ashleyjwu)
* [Charline Chen](https://github.com/charxmandr)
* [Hana Yoon](https://github.com/cloyooni)
* [Theanh Nguyen](https://github.com/tn82596)
