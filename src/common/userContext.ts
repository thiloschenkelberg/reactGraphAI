import { createContext } from "react";
import IUser from "../types/user.type";

const initialUser: IUser = {
  id: -1,
  username: "",
  email: "",
  password: ""
};
  
  const userContext = createContext<IUser | undefined>(initialUser);

export { userContext };