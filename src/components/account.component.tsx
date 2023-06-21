import { useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "react-query"
import IUser from "../types/user.type"
import client from "../client"
import { userContext } from "../common/userContext"

export default function Account() {
  const user = useContext(userContext)

  return (
    <div className="container">
      {user && (
        <div>
          <header className="jumbotron">
            <h3>
              {user.name && (
                <strong>{user.name}</strong>
              )}
               Account
            </h3>
          </header>
          <p>
            <strong>Id:</strong> {user.id}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <strong>Authorities:</strong>
          <ul>
            {user.roles &&
              user.roles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
