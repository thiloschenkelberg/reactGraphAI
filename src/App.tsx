import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { Routes, Route} from "react-router-dom"
import { userContext } from "./common/userContext"
import { Toaster, toast } from "react-hot-toast"
import Header from "./components/Header"
import {MDB_IUser as IUser} from "./types/user.type"

import client from "./client"

import Home from "./components/Home"
import Search from "./components/Search"
import History from "./components/History"
import Profile from "./components/Profile"
import AuthenticationForm from "./components/Authentication"

import "bootstrap/dist/css/bootstrap.min.css"
import "./App.css"

export default function App() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()

  const {
    data: currentUser,
    isLoading,
    isError,
    error
  } = useQuery<IUser | null | undefined>(
    "getCurrentUser",
    client.getCurrentUser
  )

  useEffect(() => {
    // navigate to login after getCurrentUser is 
    // resolved and currentUser is undefined
    // errors are caught separately
    if (!isLoading && !currentUser) {
      navigate("/login")
    }
  }, [isLoading, currentUser, navigate])

  useEffect(() => {
    if (isError) {
      const err = error as Error
      console.log(err.message)
    }
  }, [isError, error])

  // useEffect(() => {
  //   if (isLoading) {
  //     //something
  //   }
  // }, [isLoading])
  
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
        {currentUser &&(
          <div className="header">
            <Header handleHeaderLinkClick={handleHeaderLinkClick} handleLogout={handleLogout}/>
          </div>
        )}
        {/* <div className="header">
          <HeaderTabs onHeaderLinkClick={handleHeaderLinkClick} onLogout={handleLogout} tab={activeTab} setTab={setTab}/>
        </div> */}
        <div className="main-window">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search colorIndex={currentColorIndex} />} />
            <Route path="/history" element={<History />} />
            <Route path="/login" element={<AuthenticationForm />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </userContext.Provider>
      <Toaster
        position="top-center"
        containerStyle={{
          top: "75px" // Toast position
        }}
        toastOptions={{
          style: {
            borderRadius: "5px",
            background: "#25262b",
            color: "#C1C2C5"
          }
        }}
      />
    </div>
  )
}
