import { useState, useEffect } from "react"
import { useQuery, useQueryClient } from "react-query"
import { useNavigate, useLocation } from "react-router-dom"
import { Routes, Route} from "react-router-dom"
import { userContext } from "./common/userContext"
import { Toaster, toast } from "react-hot-toast"
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
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<string | null>(
    () => localStorage.getItem("activeTab") || null
  )

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

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab || "")
  }, [activeTab])

  const setTab = (value: string | null) => {
    setActiveTab(value)
  }
  
  const handleHeaderLinkClick = (key: string) => {
    navigate(key)
  }

  const handleLogout = () => {
    queryClient.setQueryData<IUser | null | undefined>("getCurrentUser", undefined)
    setActiveTab("")
    document.cookie = "token="
    navigate("/login")

  }

  const currentColorIndex = 0 // make colorPalette choosable in settings later

  return (
    <div className="wrap-app">
      <userContext.Provider value={currentUser}>
        {currentUser &&(
          <div className="header">
            <HeaderTabs onHeaderLinkClick={handleHeaderLinkClick} onLogout={handleLogout} tab={activeTab} setTab={setTab} pathname={location.pathname}/>
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
            <Route path="/login" element={<AuthenticationForm setTab={setTab}/>} />
            <Route path="/account" element={<Account />} />
          </Routes>
        </div>
      </userContext.Provider>
      <Toaster
        position="top-center"
        containerStyle={{
          top: "105px"
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
