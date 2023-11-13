"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var user_repo_sqlite_1 = __importDefault(require("../repositories/user.repo-sqlite"));
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var UserService = /** @class */ (function () {
    function UserService() {
    }
    UserService.findByMail = function (email) {
        // Additional business logic or validation can be performed here
        return user_repo_sqlite_1.default.findByMail(email);
    };
    UserService.findByUsername = function (username) {
        return user_repo_sqlite_1.default.findByUsername(username);
    };
    UserService.findByID = function (id) {
        return user_repo_sqlite_1.default.findByID(id);
    };
    UserService.createUser = function (username, email, password) {
        // Additional business logic or validation can be performed here
        return user_repo_sqlite_1.default.create(username, email, password);
    };
    UserService.deleteUser = function (id) {
        return user_repo_sqlite_1.default.delete(id);
    };
    UserService.updateName = function (name, id) {
        return user_repo_sqlite_1.default.updateName(name, id);
    };
    UserService.updateUsername = function (username, id) {
        return user_repo_sqlite_1.default.updateUsername(username, id);
    };
    UserService.updateInstitution = function (institution, id) {
        return user_repo_sqlite_1.default.updateInstitution(institution, id);
    };
    UserService.updateMail = function (newMail, id) {
        return user_repo_sqlite_1.default.updateMail(newMail, id);
    };
    UserService.updatePassword = function (newPass, id) {
        return user_repo_sqlite_1.default.updatePassword(newPass, id);
    };
    UserService.updateImgUrl = function (url, id) {
        return user_repo_sqlite_1.default.updateImgUrl(url, id);
    };
    UserService.generateAccessToken = function (id) {
        return jsonwebtoken_1.default.sign({ userId: id }, process.env.TOKEN_SECRET);
        // return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '1800s'})
    };
    UserService.authenticateToken = function (req, res, next) {
        var authHeader = req.headers["authorization"];
        var token = authHeader && authHeader.split(" ")[1];
        if (token == null)
            return res.sendStatus(401);
        // decodes the token to user email
        jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, function (err, payload) {
            if (err)
                return res.sendStatus(403);
            req.userId = payload.userId;
            next();
        });
    };
    return UserService;
}());
exports.default = UserService;
