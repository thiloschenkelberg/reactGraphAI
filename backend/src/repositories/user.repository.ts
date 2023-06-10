import sqlite3 from 'sqlite3';
import IUser from '../../../src/types/user.type'

// Create a new SQLite database connection
const db = new sqlite3.Database(':memory:');
// You can replace ':memory:' with a file path to use a persistent database

// Create the users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

class UserRepository {
  static findByUsername(username: string): Promise<IUser | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as IUser | undefined);
        }
      });
    });
  }

  static create(username: string, email: string, password: string): Promise<IUser> {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, password], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, email, password });
        }
      });
    });
  }
}

export default UserRepository;