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
    res.status(500).send('Internal Server Error')
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

    userService.createUser(credentials);
    res.status(201).json({
      status: 201,
      message: 'User created successfully.'
    });
  } catch (err) {
    if (err.code === 'USERNAME_ALREADY_EXISTS') {
      res.status(409).json({
        status: 409,
        message: 'Username already exists.'
      });
    } else if (err.code === 'EMAIL_ALREADY_EXISTS') {
      res.status(409).json({
        status: 409,
        message: 'Email already exists.'
      });
    } else {
      res.status(400).json({
        status: 400,
        message: 'Invalid signup request.'
      });
    }
  }
})

router.get



router.get('/users/')

// Additional API endpoints for updating, deleting users, etc.

export default router;
