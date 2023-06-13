import { useState, useEffect } from "react";
import { useQuery } from "react-query";
import { Routes, Route, Link } from "react-router-dom";
import { userContext } from "./common/userContext";
import { Toaster } from 'react-hot-toast';
import { NavbarMinimal } from "./components/navbar.component";


import client from './client';
import IUser from './types/user.type';

import Login from './components/login.component';
import Profile from './components/profile.component';
import BoardAdmin from './components/board-admin.component';
import { AuthenticationForm } from "./components/authentication.component";

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
      <userContext.Provider value={currentUser}>
        {currentUser ? (
          <div className='wrap-login'>
          <NavbarMinimal />
          </div>
        ) : (
          <div className="wrap-login">
          <AuthenticationForm />
          </div>
        )}
      </userContext.Provider>
      <Routes>
          {/* <Route path="/login" element={<AuthenticationForm />} /> */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<BoardAdmin />} />
      </Routes>
      <Toaster />
    </div>
  );
};
