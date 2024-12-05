# Running ChitChat locally

In the project directory, you can run:

### `npm i`

This downloads all dependencies needed that are declared in the package.json.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

In a separate terminal, navigate to the backend directory (cd backend). You can run:

### `npm i`

This downloads all dependencies for the backend that are declared in the package.json

### `mkdir .env`

Makes your .env file. This file should be formatted like so: \
MONGO_URI=... \
JWT_SECRET=...

Follow these instructions to obtain your mongo url and jwt secret (add later)

### `node server.js`

Sets up web server to process requests from the web browser.
