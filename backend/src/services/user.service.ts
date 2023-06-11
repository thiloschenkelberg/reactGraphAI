import UserRepository from "../repositories/user.repository";
import IUser from '../../../src/types/user.type'
import jwt from 'jsonwebtoken'

import dotenv from 'dotenv'
dotenv.config();

class UserService {
  static findByUsername(username: string): Promise<IUser | undefined> {
    // Additional business logic or validation can be performed here
    return UserRepository.findByUsername(username);
  }

  static createUser(username: string, email: string, password: string): Promise<IUser> {
    // Additional business logic or validation can be performed here
    return UserRepository.create(username, email, password);
  }

  static generateAccessToken(username: string) {
    return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: '1800s'})
  }

  static authenticateToken(req,res,next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET, (err: Error | null, user: any) => {
      console.log(err);

      if (err) return res.sendStatus(403);

      req.user = user;
      
      next();
    });
  }

}

export default UserService;