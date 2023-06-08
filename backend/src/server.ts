import express from 'express';
import userRouter from './controllers/user.controller';

const app = express();
const port = 8080; // Set the desired port number

// Middleware
app.use(express.json());

// API routes
app.use(userRouter); // Mount the user routes

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
