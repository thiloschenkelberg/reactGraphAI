// import { useEffect, useContext, useState } from "react"
// import { useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "react-query"
import IUser from "../types/user.type"
import client from "../client"
// import { userContext } from "../common/userContext"
import { toast } from "react-hot-toast"
import { useForm } from "@mantine/form"
import { useQueryClient } from "react-query"
import {
  Paper,
  PaperProps,
  TextInput,
  Button,
  PasswordInput,
} from "@mantine/core"

import { PiEye, PiEyeSlash, PiLock, PiLockOpen } from "react-icons/pi"
import { useEffect, useRef, useState } from "react"
import { useSpring, animated } from "react-spring"

export default function Account(props: PaperProps) {
  const queryClient = useQueryClient()
  const { data: currentUser } = useQuery<IUser | null | undefined>(
    "getCurrentUser",
    client.getCurrentUser
  )
  const [passwordLocked, setPasswordLocked] = useState(true)
  const [showUnlockPasswordForm, setShowUnlockPasswordForm] = useState(false)
  const [unlockFormUpperBound, setUnlockFormUpperBound] = useState(0)
  const emailRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUnlockFormUpperBoundFn()
  }, [])

  const setUnlockFormUpperBoundFn = () => {
    if (emailRef.current) {
      console.log(emailRef.current.getBoundingClientRect().bottom)
      setUnlockFormUpperBound(emailRef.current.getBoundingClientRect().bottom)
    }
  }

  // shows new password form when current password could be authenticated
  const togglePasswordLock = () => {
    setShowUnlockPasswordForm(false)
    setPasswordLocked(false)
  }

  // shows current password form when clicking the lock
  const toggleUnlockPasswordForm = () => {
    if (passwordLocked) {
      setShowUnlockPasswordForm(true)
    } else {
      setShowUnlockPasswordForm(false)
      setPasswordLocked(true)
    }
  }

  const nameMutation = useMutation("updateName", updateName, {
    onSuccess: () => {
      queryClient.invalidateQueries("getCurrentUser")
      toast.success("Update name successful!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    },
  })

  const usernameMutation = useMutation("updateUsername", updateUsername, {
    onSuccess: () => {
      queryClient.invalidateQueries("getCurrentUser")
      toast.success("Update username successful!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    },
  })

  const mailMutation = useMutation("updateMail", updateMail, {
    onSuccess: () => {
      queryClient.invalidateQueries("getCurrentUser")
      toast.success("Update email successful!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    },
  })

  const passwordMutation = useMutation("updatePassword", updatePassword, {
    onSuccess: () => {
      queryClient.invalidateQueries("getCurrentUser")
      toast.success("Update password succesful!")
    },
    onError: (err: any) => {
      toast.error(err.message)
    },
  })

  const unlockPasswordMutation = useMutation("unlockPassword", unlockPassword, {
    onSuccess: () => {
      console.log("unlock success")
      togglePasswordLock()
      updateForm.setFieldValue("oldPassword", unlockForm.values.password)
    },
    onError: (err: any) => {
      console.log("unlock error")
      toast.error(err.message)
    },
  })

  // const institutionMutation = useMutation("updateInstitution", updateInstitution, {
  //   onSuccess: () => {
  //     toast.success("Update institution succesful.")
  //   },
  //   onError: () => {
  //     toast.error("Institution could not be updated.")
  //   }
  // })

  const updateForm = useForm({
    initialValues: {
      name: currentUser?.name || "",
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      confirmEmail: "",
      password: "",
      confirmPassword: "",
      oldPassword: "",
      institution: currentUser?.institution || "",
    },

    validate: {
      email: (val, values) =>
        val === currentUser?.email
          ? val === values.confirmEmail
            ? "Email is unchanged."
            : null
          : /^\S+@\S+$/.test(val)
          ? null
          : "Invalid email.",
      confirmEmail: (value, values) =>
        value.length > 0
          ? value === values.email // check if confirmEmail == email
            ? null
            : "Emails do not match."
          : values.email !== currentUser?.email
          ? "Emails do not match."
          : null,
      password: (val) =>
        val.length > 1 && val.length < 6
          ? "Password should include at least 6 characters"
          : null,
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match.",
    },
  })

  const unlockForm = useForm({
    initialValues: {
      password: "",
    },

    validate: {
      password: (val) => (val.length < 1 ? "Password invalid." : null),
    },
  })

  type UpdateFormValues = typeof updateForm.values
  type UnlockFormValues = typeof unlockForm.values

  const handleSubmit = (formValues: UpdateFormValues) => {
    // If name has been filled or changed
    if (formValues.name !== "") {
      if (formValues.name !== currentUser?.name) {
        console.log("name mutation")
        nameMutation.mutate(formValues)
      }
    }

    if (formValues.username !== "") {
      if (formValues.username !== currentUser?.username)
        console.log("uname mutation")
      usernameMutation.mutate(formValues)
    }

    // If email has been filled or changed
    if (
      formValues.email !== currentUser?.email &&
      formValues.confirmEmail.length > 0
    ) {
      console.log("mail mutation")
      mailMutation.mutate(formValues)
    }

    if (formValues.password.length > 5) {
      console.log("pw mutation")
      passwordMutation.mutate(formValues)
    }

    // if (formValues.institution !== currentUser?.institution) {
    //   institutionMutation.mutate(formValues)
    // }


  }

  const handleUnlockSubmit = (formValues: UnlockFormValues) => {
    unlockPasswordMutation.mutate(formValues)
  }

  async function updateName(credentials: UpdateFormValues) {
    try {
      const { name } = credentials

      const response = await client.updateName(name)

      return response.data
    } catch (err: any) {
      throw new Error(err.message)
    }
  }

  async function updateUsername(credentials: UpdateFormValues) {
    try {
      const { username } = credentials

      const response = await client.updateUsername(username)

      return response.data
    } catch (err: any) {
      throw err
    }
  }

  async function updateMail(credentials: UpdateFormValues) {
    try {
      const { email } = credentials

      // Calling the API and getting the response
      const response = await client.updateMail(email)

      return response.data
    } catch (err: any) {
      throw err
    }
  }

  async function unlockPassword(credentials: UnlockFormValues) {
    try {
      const { password } = credentials

      const response = await client.authenticatePassword(password)

      return response.data
    } catch (err: any) {
      throw err
    }
  }

  async function updatePassword(credentials: UpdateFormValues) {
    try {
      const { oldPassword, password } = credentials

      const response = await client.updatePassword(password, oldPassword)

      return response.data
    } catch (err: any) {
      throw err
    }
  }

  // async function updateInstitution(credentials: UpdateFormValues) {
  //   try {
  //     const { institution } = credentials
  //     const response = await client.updateInstitution(institution)
  //   } catch (err: any) {

  //   }
  // }

  const lockAnim = useSpring({
    left: showUnlockPasswordForm ? 22 : 260,
    opacity: showUnlockPasswordForm ? 1 : 1,
    scale: showUnlockPasswordForm ? 1.1 : 1.5,
  })

  const unlockPassInputAnim = useSpring({
    opacity: showUnlockPasswordForm ? 1 : 0,
  })

  return (
    <>
      <div className="wrap-account">
        {currentUser && (
          <Paper
            radius="md"
            p="xl"
            withBorder
            {...props}
            style={{
              padding: "0 0 0 0px",
            }}
          >
            <h3
              style={{
                marginBottom: 40,
                marginTop: 60,
                marginLeft: 40,
                width: 440,
              }}
            >
              Edit Account
            </h3>

            <form
              onSubmit={updateForm.onSubmit(handleSubmit)}
              style={{
                paddingBottom: 20,
              }}
            >
              {/* Full Name and Username */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <TextInput
                  label="Full Name"
                  placeholder={
                    currentUser.name ? currentUser.name : "Your name"
                  }
                  value={updateForm.values.name}
                  onChange={(event) =>
                    updateForm.setFieldValue("name", event.currentTarget.value)
                  }
                  radius="md"
                  style={{
                    width: 200,
                    marginBottom: 20,
                    marginRight: 40,
                  }}
                />
                <TextInput
                  label="Username"
                  placeholder={currentUser.username}
                  value={updateForm.values.username}
                  onChange={(event) =>
                    updateForm.setFieldValue(
                      "username",
                      event.currentTarget.value
                    )
                  }
                  radius="md"
                  style={{
                    width: 200,
                  }}
                />
              </div>
              {/* Institution */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
              >
                <TextInput
                  label="Institution"
                  placeholder={
                    currentUser.institution
                      ? currentUser.institution
                      : "Your institution"
                  }
                  value={updateForm.values.institution}
                  onChange={(event) =>
                    updateForm.setFieldValue(
                      "institution",
                      event.currentTarget.value
                    )
                  }
                  radius="md"
                  style={{
                    width: 440,
                    marginBottom: 20,
                    marginLeft: 0,
                  }}
                />
              </div>
              {/* Email and Email Confirmation */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  flexDirection: "row",
                }}
                ref={emailRef}
              >
                <TextInput
                  label="Email Address"
                  // placeholder={currentUser.email}
                  value={updateForm.values.email}
                  onChange={(event) =>
                    updateForm.setFieldValue("email", event.currentTarget.value)
                  }
                  error={updateForm.errors.email}
                  radius="md"
                  style={{
                    width: 200,
                    marginBottom: 20,
                    marginRight: 40,
                  }}
                />
                <TextInput
                  label="Confirm Email Address"
                  placeholder={currentUser.email}
                  value={updateForm.values.confirmEmail}
                  onChange={(event) =>
                    updateForm.setFieldValue(
                      "confirmEmail",
                      event.currentTarget.value
                    )
                  }
                  error={updateForm.errors.confirmEmail}
                  radius="md"
                  style={{
                    width: 200,
                  }}
                />
              </div>
              {/* Password and Password Confirmation*/}
                <div
                  style={{
                    // position: "absolute",
                    display: "flex",
                    justifyContent: "center",
                    flexDirection: "row",
                    filter: passwordLocked ? "blur(3px)" : "none",
                  }}
                >
                  <PasswordInput
                    disabled={passwordLocked}
                    label="New Password"
                    placeholder={"Your new password"}
                    value={updateForm.values.password}
                    onChange={(event) =>
                      updateForm.setFieldValue(
                        "password",
                        event.currentTarget.value
                      )
                    }
                    radius="md"
                    style={{
                      width: 200,
                      marginBottom: 20,
                      marginRight: 40,
                    }}
                    error={updateForm.errors.password}
                  />
                  <PasswordInput
                    disabled={passwordLocked}
                    label="Confirm New Password"
                    placeholder={"Password confirmation"}
                    value={updateForm.values.confirmPassword}
                    onChange={(event) =>
                      updateForm.setFieldValue(
                        "confirmPassword",
                        event.currentTarget.value
                      )
                    }
                    error={updateForm.errors.confirmPassword}
                    radius="md"
                    style={{
                      width: 200,
                    }}
                  />                
              </div>
              {/* Confirmation button */}
              <div
                style={{
                  marginTop: 20,
                  marginLeft: 40,
                  marginBottom: 20,
                }}
              >
                <Button type="submit" radius="xl" onClick={setUnlockFormUpperBoundFn}>
                  Confirm changes
                </Button>
              </div>
            </form>
            {passwordLocked && (
                  <div className="password-overlay"
                    style={{
                      top: 0,
                      position: "absolute",
                    }}
                  >

                    {/* Overlay Background */}
                    <div
                      className="password-overlay-background"
                      style={{
                        width: 500,
                        height: 100,
                        left: 10,
                        position: "absolute",
                        backgroundColor: "#1a1b1e",
                        opacity: showUnlockPasswordForm ? 1 : 0.5,
                      }}
                    />

                    {/* Lock button   */}
                    <animated.div
                      style={{
                        position: "absolute",
                        transform: "translate(-50%,0px)",
                        ...lockAnim,
                      }}
                    >
                      <button
                        onClick={toggleUnlockPasswordForm}
                        type="button"
                        style={{ background: "none", border: "none" }}
                      >
                        {passwordLocked ? (
                          <PiLock color="#c1c2c5" />
                        ) : (
                          <PiEye color="#c1c2c5" />
                        )}
                      </button>
                    </animated.div>

                    {/* Unlock password form */}
                    {showUnlockPasswordForm && (
                      <form onSubmit={(event) => {event.preventDefault(); unlockForm.onSubmit(handleUnlockSubmit)}}>
                        <animated.div
                          style={{
                            position: "relative",
                            width: 440,
                            height: 100,
                            top: 0,
                            ...unlockPassInputAnim,
                          }}
                        >
                          <TextInput
                            autoFocus
                            type="password"
                            label="Current Password"
                            placeholder="Your password"
                            disabled={!showUnlockPasswordForm}
                            value={unlockForm.values.password}
                            onChange={(event) =>
                              unlockForm.setFieldValue(
                                "password",
                                event.currentTarget.value
                              )
                            }
                            radius="md"
                            style={{
                              position: "absolute",
                              top: 0,
                              width: 440,
                            }}
                          />
                        </animated.div>
                        <button
                          type="submit"
                          style={{ display: "none" }}
                        ></button>
                      </form>
                    )}
                  </div>
                )}
          </Paper>
        )}
      </div>

      {/* {showUnlockPasswordForm && (
        <div className="account-overlay">
          <div className="account-modal">
            <h4>Enter Password</h4>
            <form
              onSubmit={unlockForm.onSubmit(handleUnlockSubmit)}
            >
              <TextInput
                autoFocus
                type="password"
                value={unlockForm.values.password}
                onChange={(event) =>
                  unlockForm.setFieldValue("password", event.currentTarget.value)
                }
                radius="md"
                style={{
                  width:250,
                }}
              />
              <div style={{position:"absolute", right: 10,transform:"translate(0,40px)"}}>       
                <button onClick={togglePasswordVisibility} type="button" style={{background: 'none', border: 'none'}}>
                  {visiblePasswords ? <PiEyeSlash color="#c1c2c5"/> : <PiEye color="#c1c2c5"/>}
                </button>
              </div>
              <button type="submit" style={{ display: 'none' }}></button>
            </form>
          </div>
        </div>
      )} */}
    </>
  )
}
