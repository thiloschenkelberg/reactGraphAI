import UserRepository from "../repositories/user.repository"
import IUser from "../types/user.type"
import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"
import { IGetUserAuthInfoRequest } from "../types/req"

import dotenv from "dotenv"
dotenv.config()

class UserService {
  static findByMail(email: string): Promise<IUser | undefined> {
    // Additional business logic or validation can be performed here
    return UserRepository.findByMail(email)
  }

  static createUser(
    name: string,
    email: string,
    password: string
  ): Promise<IUser> {
    // Additional business logic or validation can be performed here
    return UserRepository.create(name, email, password)
  }

  static updateName(
    name: string,
    email: string
  ): Promise<boolean> {
    return UserRepository.updateName(name, email)
  }

  static updateMail(
    newEmail: string,
    oldEmail: string
  ): Promise<boolean> {
    return UserRepository.updateMail(newEmail, oldEmail)
  }

  static generateAccessToken(email: string) {
    return jwt.sign(email, process.env.TOKEN_SECRET as string)
    // return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '1800s'})
  }

  static authenticateToken(
    req: IGetUserAuthInfoRequest,
    res: Response,
    next: NextFunction
  ) {
    const authHeader = req.headers["authorization"]

    const token = authHeader && authHeader.split(" ")[1]

    if (token == null) return res.sendStatus(401)

    // decodes the token to user email
    jwt.verify(
      token,
      process.env.TOKEN_SECRET as string,
      (err: Error | null, email: any) => {
        if (err) return res.sendStatus(403)

        console.log

        req.email = email

        next()
      }
    )
  }
}

export default UserService
