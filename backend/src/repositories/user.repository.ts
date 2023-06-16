import sqlite3 from 'sqlite3';
import IUser from '../types/user.type';

// Create a new SQLite database connection
const db = new sqlite3.Database(':memory:');
// You can replace ':memory:' with a file path to use a persistent database

// Create the users table if it doesn't exist
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

class UserRepository {
  static findByMail(email: string): Promise<IUser | undefined> {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row as IUser | undefined);
        }
      });
    });
  }

  static create(name: string, email: string, password: string): Promise<IUser> {
    return new Promise((resolve, reject) => {
      db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, password], function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, name, email, password });
        }
      });
    });
  }
}

export default UserRepository;