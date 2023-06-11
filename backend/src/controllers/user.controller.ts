import express from 'express';
import bcrypt from 'bcrypt';
import UserService from '../services/user.service';

const router = express.Router();

router.post('/api/users/signin', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: 'Fields required!'
      });
    }

    const user = await UserService.findByUsername( username );
    if (!user) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    const token = UserService.generateAccessToken(username);
    res.json(token);

  }
  catch (err) {
    res.status(500).send('Internal Server Error.')
  }

});

router.post('/api/users/signup', async (req, res) => {
  try {
    const { username, email, password} = req.body;
    if(!username || !email || !password) {
      return res.status(400).json({
        message: 'Fields required!'
      });
    }

    const existingUser = await UserService.findByUsername( username );
    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists!'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserService.createUser( username, email, hashedPassword);
    if (newUser) {
      return res.status(201).json({
        message: 'User created successfully.'
      });
    }
  } catch (err) {
    res.status(500).send('Internal Server Error.')
  }

})

router.get('/api/users/current', UserService.authenticateToken, (req, res) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      res.status(401).json({
        message: 'Unauthorized access.'
      });
    }

    res.status(200).json(currentUser);
    //
  } catch (err) {
    res.status(500).send('Internal Server Error.')
  }
})

// Additional API endpoints for updating, deleting users, etc.

export default router;
