import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { Routes, Route, Link } from "react-router-dom";
import { userContext } from "./common/userContext";
import { Toaster } from 'react-hot-toast';

import client from './client';
import IUser from './types/user.type';

import Login from './components/login.component';
import Profile from './components/profile.component';
import BoardAdmin from './components/board-admin.component';

import EventBus from "./common/EventBus";

import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

export default function App() {
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const { data: currentUser } = useQuery<IUser | undefined>('getCurrentUser', client.getCurrentUser);

  useEffect(() => {
    if (currentUser && currentUser.roles) {
      setShowAdminBoard(currentUser.roles.includes('ROLE_ADMIN'));
    }

    EventBus.on("logout", logOut);

    return () => {
      EventBus.remove("logout", logOut);
    };
  }, [currentUser]);

  const logOut = () => {
    //client.logout();
    setShowAdminBoard(false);
  };

  return (
    <div>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <div className="navbar-nav mr-auto">
          {showAdminBoard && (
            <li className="nav-item">
              <Link to={"/admin"} className="nav-link">
                Admin Board
              </Link>
            </li>
          )}
          {currentUser && (
            <li className="nav-item">
              <Link to={"/user"} className="nav-link">
                User
              </Link>
            </li>
          )}
        </div>
        {currentUser ? (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/profile"} className="nav-link">
                {currentUser.username}
              </Link>
            </li>
            <li className="nav-item">
              <a href="/login" className="nav-link" onClick={logOut}>
                LogOut
              </a>
            </li>
          </div>
        ) : (
          <div className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to={"/login"} className="nav-link">
                Login
              </Link>
            </li>
          </div>
        )}
      </nav>
      <userContext.Provider value={currentUser}>
      <div className="container-bg">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<BoardAdmin />} />
        </Routes>
      </div>
      </userContext.Provider>
      <Toaster />    
    </div>
    // <div>
    //   <userContext.Provider value={currentUser}>
    //   <nav className="navbar navbar-expand navbar-dark bg-dark">

    //   </nav>
    //   </userContext.Provider>
    //   <Toaster />

    // </div>
  );
};
