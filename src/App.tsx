import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { useNavigate } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { userContext } from "./common/userContext";
import { Toaster } from 'react-hot-toast';
import { NavbarMinimal } from "./components/navbar.component";
import IUser from './types/user.type';

import client from './client';
import EventBus from "./common/EventBus";

import Home from "./components/home.component";
import Profile from './components/profile.component';
import BoardAdmin from './components/board-admin.component';
import AuthenticationForm from "./components/authentication.component";

import "bootstrap/dist/css/bootstrap.min.css";
import './App.css';

export default function App() {
  const navigate = useNavigate();
  const [showAdminBoard, setShowAdminBoard] = useState(false);
  const { data: currentUser } = useQuery<IUser | undefined>('getCurrentUser', client.getCurrentUser);

  useEffect(() => {
    if (currentUser) {
      // if (currentUser.roles) {
      //   setShowAdminBoard(currentUser.roles.includes('ROLE_ADMIN'));
      // }
    } else {
      console.log('user is not')
      navigate('/login');
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
      <userContext.Provider value={currentUser}>
        {currentUser && (
          <div>
            <NavbarMinimal />
          </div>
        )}
        <Routes>
          <Route path='/' element={<Home/>} />
          <Route path='/login' element={<AuthenticationForm/>} />
          <Route path='/profile' element={<Profile/>} />
        </Routes>
      </userContext.Provider>
      <Toaster />
      </div>
  );
};
