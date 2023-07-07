import { useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "react-query"
import IUser from "../types/user.type"
import client from "../client"
import { userContext } from "../common/userContext"
import { toast } from "react-hot-toast"
import { useForm } from "@mantine/form"

export default function Account() {
  const currentUser = useContext(userContext)

  // const nameMutation = useMutation("updateName", updateName, {
  //   onSuccess: () => {
  //     toast.success("Update name successful.")
  //   },
  //   onError: () => {
  //     toast.error("Name could not be updated.")
  //   }
  // })

  // const mailMutation = useMutation("updateMail", updateMail, {
  //   onSuccess: () => {
  //     toast.success("Update email successful.")
  //   },
  //   onError: () => {
  //     toast.error("Email could not be updated.")
  //   }
  // })

  // const passwordMutation = useMutation("updatePassword", updatePassword, {
  //   onSuccess: () => {
  //     toast.success("Update password succesful.")
  //   },
  //   onError: () => {
  //     toast.error("Password could not be updated.")
  //   }
  // })

  // const nameForm = useForm({
  //   initialValues: {
  //     name: ""
  //   },
  // })

  // const emailForm = useForm({
  //   initialValues: {
  //     email: ""
  //   },
  // })

  // const passwordForm = useForm({
  //   initialValues: {
  //     newPass: "",
  //     oldPass: "",
  //     confirmOldPass: ""
  //   },

  //   validate: {
  //     confirmOldPass: (value, values) => 
  //       value !== values.oldPass ? "Passwords do not match." : null,
  //   }
  // })
  
  return (
    <div className="container">
      {currentUser && (
        <div>
          <header className="jumbotron">
            <h3>
              {currentUser.name && (
                <strong>{currentUser.name}</strong>
              )}
               Account
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
              currentUser.roles.map((role, index) => (
                <li key={index}>{role}</li>
              ))}
          </ul>
        </div>
      )}
    </div>
  )
}
