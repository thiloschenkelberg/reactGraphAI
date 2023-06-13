import UserRepository from "../repositories/user.repository";
import IUser from '../../../src/types/user.type';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction} from 'express';

import dotenv from 'dotenv';
dotenv.config();

class UserService {
  static findByMail(email: string): Promise<IUser | undefined> {
    // Additional business logic or validation can be performed here
    return UserRepository.findByMail(email);
  }

  static createUser(name: string, email: string, password: string): Promise<IUser> {
    // Additional business logic or validation can be performed here
    return UserRepository.create(name, email, password);
  }

  static generateAccessToken(email: string) {
    return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '1800s'})
  }

  static authenticateToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.TOKEN_SECRET as string, (err: Error | null, user: any) => {
      console.log(err);

      if (err) return res.sendStatus(403);

      req.user = user;
      
      next();
    });
  }

}

export default UserService;