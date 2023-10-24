import { createContext } from "react"
import IUser from "../types/user.type"

const initialUser: IUser = {
  id: -1,
  name: "",
  username: "",
  email: "",
  password: "",
  roles: [""],
  image: "",
  institution: "",
  imgurl: "",
}

const userContext = createContext<IUser | null | undefined>(initialUser)

export { userContext }
export { initialUser }