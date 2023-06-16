import express from 'express'
import bcrypt from 'bcrypt';
import UserService from '../services/user.service';
import { IGetUserAuthInfoRequest } from '../types/req';
import { Response } from 'express';

const router = express.Router();

router.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: 'Fields required!'
      });
    }

    const user = await UserService.findByMail( email );
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

    const token = UserService.generateAccessToken(email);
    return res.status(200).json({
      message: 'Login successful.',
      token: token,
    });
  }
  catch (err) {
    res.status(500).send('Internal Server Error.')
  }

});

router.post('/api/users/register', async (req, res) => {
  try {

    const { name, email, password} = req.body;
    if(!name || !email || !password) {
      return res.status(400).json({
        message: 'Fields required!'
      });
    }

    const existingUser = await UserService.findByMail( email );
    if (existingUser) {
      return res.status(409).json({
        message: 'Username already exists!'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await UserService.createUser( name, email, hashedPassword);
    if (newUser) {
      return res.status(201).json({
        message: 'User created successfully.'
      });
    }
  } catch (err) {
    res.status(500).send('Internal Server Error.')
  }

})

router.get('/api/users/current', UserService.authenticateToken, (req: IGetUserAuthInfoRequest, res: Response) => {
  try {
    const currentUser = req.user;
    if (!currentUser) {
      res.status(401).json({
        message: 'Unauthorized access.'
      });
    }

    return res.status(200).json(currentUser);
    
  } catch (err) {
    res.status(500).send('Internal Server Error.')
  }
})

// Additional API endpoints for updating, deleting users, etc.

export default router;
