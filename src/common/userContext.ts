import { createContext } from "react"
import IUser from "../types/user.type"

const initialUser: IUser = {
  id: -1,
  name: "",
  email: "",
  password: "",
}

const userContext = createContext<IUser | null | undefined>(initialUser)

export { userContext }
