import { useState, useEffect } from "react"
import { useQuery } from "react-query"
import { useNavigate } from "react-router-dom"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"
import { userContext } from "./common/userContext"
import { Toaster } from "react-hot-toast"
import { NavbarMinimal } from "./components/navbar.component"
import { HeaderTabs } from "./components/header.component"
import IUser from "./types/user.type"

import client from "./client"
import EventBus from "./common/EventBus"

import Home from "./components/home.component"
import Profile from "./components/profile.component"
import BoardAdmin from "./components/board-admin.component"
import AuthenticationForm from "./components/authentication.component"

import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

export default function App() {
  const navigate = useNavigate()
  const [showAdminBoard, setShowAdminBoard] = useState(false)
  const [active, setActive] = useState<number>(0)
  const {
    data: currentUser,
    isLoading,
    isError,
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

  const handleNavbarLinkClick = (index: number) => {
    setActive(index)
  }

  return (
    <div className="wrap-app">
      <userContext.Provider value={currentUser}>
        {currentUser && (
          // <div className="wrap-navbar">
          //   <NavbarMinimal active={active} onNavbarLinkClick={handleNavbarLinkClick}/>
          // </div>
          <div>
            <HeaderTabs active={active} onNavbarLinkClick={handleNavbarLinkClick}/>
          </div>
        )}
        <Routes>
          <Route path="/" element={<Home active={active}/>} />
          <Route path="/login" element={<AuthenticationForm />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </userContext.Provider>
      <Toaster />
    </div>
  )
}
