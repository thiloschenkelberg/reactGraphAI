import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { Routes, Route} from "react-router-dom"
import { userContext } from "./common/userContext"
import { Toaster } from "react-hot-toast"
import { HeaderTabs } from "./components/header.component"
import IUser from "./types/user.type"

import client from "./client"

import Home from "./components/home.component"
import Search from "./components/search.component"
import History from "./components/history.component"
import Account from "./components/account.component"
import AuthenticationForm from "./components/authentication.component"

import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

export default function App() {
  const navigate = useNavigate()
  const [active, setActive] = useState<number>(0)
  const queryClient = useQueryClient()

  const {
    data: currentUser,
    isLoading,
    isError
  } = useQuery<IUser | null | undefined>(
    "getCurrentUser",
    client.getCurrentUser
  )

  useEffect(() => {
    // navigate to login after getCurrentUser is successfully 
    // resolved and currentUser is undefined
    if (!isLoading && !isError && !currentUser) {
      navigate("/login")
    }
  }, [isLoading, isError, currentUser, navigate])

  if (isLoading) {
    console.log("loading")
    return <div></div>
  }

  if (isError) {
    console.log("error")
    // handle error
  }

  const handleHeaderLinkClick = (key: string) => {
    navigate(key)
  }

  const handleLogout = () => {
    queryClient.setQueryData<IUser | null | undefined>("getCurrentUser", undefined)
    document.cookie = "token="
    navigate("/login")
  }

  const currentColorIndex = 0 // make colorPalette choosable in settings later

  return (
    <div className="wrap-app">
      <userContext.Provider value={currentUser}>
        {currentUser && (
          <div>
            <HeaderTabs onHeaderLinkClick={handleHeaderLinkClick} onLogout={handleLogout}/>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/search" element={<Search colorIndex={currentColorIndex} />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<AuthenticationForm />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </userContext.Provider>
      <Toaster />
    </div>
  )
}
