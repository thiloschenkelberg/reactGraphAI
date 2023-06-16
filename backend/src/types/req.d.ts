import { Request } from "express";
import IUser from "./user.type";

export interface IGetUserAuthInfoRequest extends Request {
  user?:IUser,
}