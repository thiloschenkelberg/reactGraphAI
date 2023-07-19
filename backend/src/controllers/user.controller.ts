import express from "express"
import bcrypt from "bcrypt"
import UserService from "../services/user.service"
import { IGetUserAuthInfoRequest } from "../types/req"
import { Response } from "express"

const router = express.Router()

router.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        message: "Fields required!",
      })
    }

    const user = await UserService.findByMail(email)
    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid credentials",
      })
    }

    const token = UserService.generateAccessToken(email)
    return res.status(200).json({
      message: "Login successful.",
      token: token,
    })
  } catch (err) {
    res.status(500).send("Internal Server Error.")
  }
})

router.post("/api/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({
        message: "Fields required!",
      })
    }

    const existingUser = await UserService.findByMail(email)
    if (existingUser) {
      return res.status(409).json({
        message: "Username already exists!",
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const createSuccess = await UserService.createUser(
      name,
      email,
      hashedPassword
    )
    if (createSuccess) {
      return res.status(201).json({
        message: "User created successfully.",
      })
    }
  } catch (err) {
    res.status(500).send("Internal Server Error.")
  }
})

router.delete(
  "/api/users/delete",
  UserService.authenticateToken,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const email = req.email
      if (!email) {
        return res.status(401).json({
          message: "Unauthorized access.",
        })
      }

      const deleteSuccess = await UserService.deleteUser(email)
      if (deleteSuccess) {
        return res.status(200).json({
          message: "User deleted successfully.",
        })
      }
    } catch (err) {
      res.status(500).send("Internal Server Error.")
    }
  }
)

router.get(
  "/api/users/current",
  UserService.authenticateToken,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const email = req.email // req.mail should be decoded user mail
      if (!email) {
        return res.status(401).json({
          message: "Unauthorized access.",
        })
      }

      const currentUser = await UserService.findByMail(email)
      if (!currentUser) {
        return res.status(404).json({
          message: "User not found.",
        })
      }

      return res.status(200).json(currentUser)
    } catch (err) {
      res.status(500).send("Internal Server Error.")
    }
  }
)

router.patch(
  "/api/users/update/name",
  UserService.authenticateToken,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const email = req.email
      if (!email) {
        return res.status(401).json({
          message: "Unauthorized access.",
        })
      }

      const name = req.body

      const updateSuccess = await UserService.updateName(name, email)
      if (!updateSuccess) {
        return res.status(400).json({
          message: "Update not successful.",
        })
      }

      return res.status(200).json({
        message: "Name successfully updated.",
      })
    } catch (err) {
      res.status(500).send("Internal Server Error.")
    }
  }
)

router.patch(
  "/api/users/update/email",
  UserService.authenticateToken,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const oldMail = req.email
      if (!oldMail) {
        return res.status(401).json({
          message: "Unauthorized access.",
        })
      }

      const newMail = req.body

      const updateSuccess = await UserService.updateMail(newMail, oldMail)
      if (!updateSuccess) {
        return res.status(400).json({
          message: "Update not successful.",
        })
      }

      const token = UserService.generateAccessToken(newMail)

      return res.status(200).json({
        message: "E-Mail successfully updated.",
        token: token,
      })
    } catch (err) {
      res.status(500).send("Internal Server Error.")
    }
  }
)

router.patch(
  "/api/users/update/password",
  UserService.authenticateToken,
  async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const email = req.email
      if (!email) {
        return res.status(401).json({
          message: "Unauthorized access.",
        })
      }

      const user = await UserService.findByMail(email)
      if (!user) {
        return res.status(401).json({
          message: "Unauthorized access.",
        })
      }

      const { newPass, oldPass } = req.body

      const isPasswordValid = await bcrypt.compare(oldPass, user.password)
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid password.",
        })
      }

      const newHashedPass = await bcrypt.hash(newPass, 10)
      const updateSuccess = await UserService.updatePassword(
        newHashedPass,
        oldPass
      )
      if (!updateSuccess) {
        return res.status(400).json({
          message: "Update not successful.",
        })
      }

      return res.status(200).json({
        message: "Password successfully updated.",
      })
    } catch (err) {
      res.status(500).send("Internal Server Error.")
    }
  }
)

// Additional API endpoints for updating, deleting users, etc.

export default router