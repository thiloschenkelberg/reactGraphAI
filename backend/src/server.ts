import express from "express"
import userRouter from "./controllers/user.controller"
import cors from "cors"

const app = express()
const port = process.env.PORT || 8080 // Set the desired port number

// Middleware
app.use(express.json())

app.use(cors())

// API routes
app.use(userRouter) // Mount the user routes

app.get("/api/test", (req, res) => {
  try {res.send("jello")}
  catch (err: any) {
    return res.status(500).send(err.message)
  }
})

// // Start the server (local)
app.listen(port, () => {
  console.log(`Server is running on port ${port}`)
})
