import sqlite3 from "sqlite3"
import IUser from "../types/user.type"

// Create a new SQLite database connection
// const db = new sqlite3.Database(":memory:")
const db = new sqlite3.Database("../../users.db")

// Create the users table if it doesn't exist
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  roles TEXT,
  image TEXT
)
`)

class UserRepository {
  static findByMail(email: string): Promise<IUser | undefined> {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          reject(err)
        } else {
          resolve(row as IUser | undefined)
        }
      })
    })
  }

  static create(name: string, email: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }
      )
    })
  }

  static delete(email: string): Promise<boolean> {
    return new Promise ((resolve, reject) => {
      db.run(
        "DELETE FROM users WHERE email = ?", [email],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }
      )
    })
  }

  static updateName(name: string, email: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET name = ? WHERE email = ?",
        [name, email],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }
      )
    })
  }

  static updateMail(newMail: string, oldMail: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET email = ? WHERE email = ?",
        [newMail, oldMail],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }
      )
    })
  }

  static updatePassword(newPass: string, oldPass: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      db.run(
        "UPDATE users SET password = ? WHERE password = ?",
        [newPass, oldPass],
        function (err) {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }
      )
    })
  }
}

export default UserRepository
