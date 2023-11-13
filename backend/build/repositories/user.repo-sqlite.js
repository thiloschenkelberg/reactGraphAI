"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var sqlite3_1 = __importDefault(require("sqlite3"));
// Create a new SQLite database connection
// const db = new sqlite3.Database(":memory:")
var db = new sqlite3_1.default.Database("./users.db");
// Create the users table if it doesn't exist
db.run("\n  CREATE TABLE IF NOT EXISTS users (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    name TEXT,\n    username TEXT UNIQUE NOT NULL,\n    email TEXT UNIQUE NOT NULL,\n    password TEXT NOT NULL,\n    roles TEXT,\n    image TEXT,\n    institution TEXT,\n    imgurl TEXT\n  )\n");
var UserRepository = /** @class */ (function () {
    function UserRepository() {
    }
    UserRepository.findByMail = function (email) {
        return new Promise(function (resolve, reject) {
            db.get("SELECT * FROM users WHERE email = ?", [email], function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    };
    UserRepository.findByUsername = function (username) {
        return new Promise(function (resolve, reject) {
            db.get("SELECT * FROM users WHERE username = ?", [username], function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    };
    UserRepository.findByID = function (id) {
        return new Promise(function (resolve, reject) {
            db.get("SELECT * FROM users WHERE id = ?", [id], function (err, row) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    };
    UserRepository.create = function (username, email, password) {
        return new Promise(function (resolve, reject) {
            db.run("INSERT INTO users (username, email, password) VALUES (?, ?, ?)", [username, email, password], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.delete = function (id) {
        return new Promise(function (resolve, reject) {
            db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.updateName = function (name, id) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE users SET name = ? WHERE id = ?", [name, id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.updateUsername = function (username, id) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE users SET username = ? WHERE id = ?", [username, id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.updateInstitution = function (institution, id) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE users SET institution = ? WHERE id = ?", [institution, id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.updateMail = function (newMail, id) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE users SET email = ? WHERE id = ?", [newMail, id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.updatePassword = function (newPass, id) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE users SET password = ? WHERE id = ?", [newPass, id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    UserRepository.updateImgUrl = function (url, id) {
        return new Promise(function (resolve, reject) {
            db.run("UPDATE users SET imgurl = ? WHERE id = ?", [url, id], function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    return UserRepository;
}());
exports.default = UserRepository;
