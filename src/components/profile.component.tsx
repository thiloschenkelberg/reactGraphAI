import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "react-query";
import IUser from "../types/user.type";
import client from "../client";

export default function Profile() {
  const navigate = useNavigate();
  const { data: currentUser } = useQuery<IUser | undefined>('getCurrentUser', client.getCurrentUser);


  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  return (
    <div className="container">
      {currentUser && (
        <div>
          <header className="jumbotron">
            <h3>
              <strong>{currentUser.name}</strong> Profile
            </h3>
          </header>
          <p>
            <strong>Id:</strong> {currentUser.id}
          </p>
          <p>
            <strong>Email:</strong> {currentUser.email}
          </p>
          <strong>Authorities:</strong>
          <ul>
            {currentUser.roles &&
              currentUser.roles.map((role, index) => <li key={index}>{role}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}
