# ChitChat

## Overview

ChitChat is a real-time messaging app where you can send messages to your friends in 1-on-1 and group chats, search through your texts, edit and delete your messages, react with emojis, and a secure sign-in and sign-out system.

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
> MONGO_URI=... \
> JWT_SECRET=...

Follow these instructions to obtain your mongo url and jwt secret (add later)

### `node server.js`

Sets up web server to process requests from the web browser.

---

## Contributors

* [Ashley Wu](https://github.com/ashleyjwu)
* [Charline Chen](https://github.com/charxmandr)
* [Chloe Yoon](https://github.com/cloyooni)
* [Theanh Nguyen](https://github.com/tn82596)
