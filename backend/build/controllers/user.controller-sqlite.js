"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var user_service_sqlite_1 = __importDefault(require("../services/user.service-sqlite"));
var cloudinary_1 = require("cloudinary");
var axios_1 = __importDefault(require("axios"));
var express_fileupload_1 = __importDefault(require("express-fileupload"));
var form_data_1 = __importDefault(require("form-data"));
var config_1 = require("../config");
var router = express_1.default.Router();
router.use((0, express_fileupload_1.default)());
cloudinary_1.v2.config(config_1.CLOUDINARY_CONFIG);
router.post("/api/users/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, user, isPasswordValid, token, err_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Fields required!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.findByMail(email)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Invalid credentials!",
                        })];
                }
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 2:
                isPasswordValid = _b.sent();
                if (!isPasswordValid) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Invalid credentials!",
                        })];
                }
                token = user_service_sqlite_1.default.generateAccessToken(user.id);
                return [2 /*return*/, res.status(200).json({
                        message: "Login successful!",
                        token: token,
                    })];
            case 3:
                err_1 = _b.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/api/users/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, existingMail, existingUser, hashedPassword, createSuccess, err_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 6, , 7]);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Fields required!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.findByMail(email)];
            case 1:
                existingMail = _b.sent();
                if (existingMail) {
                    return [2 /*return*/, res.status(409).json({
                            message: "Email already in use!",
                        })];
                }
                if (!username) return [3 /*break*/, 3];
                return [4 /*yield*/, user_service_sqlite_1.default.findByUsername(username)];
            case 2:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(409).json({
                            message: "Username already in use!",
                        })];
                }
                _b.label = 3;
            case 3: return [4 /*yield*/, bcrypt_1.default.hash(password, 10)];
            case 4:
                hashedPassword = _b.sent();
                return [4 /*yield*/, user_service_sqlite_1.default.createUser(username, email, hashedPassword)];
            case 5:
                createSuccess = _b.sent();
                if (createSuccess) {
                    return [2 /*return*/, res.status(201).json({
                            message: "User created successfully!",
                        })];
                }
                return [3 /*break*/, 7];
            case 6:
                err_2 = _b.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 7: return [2 /*return*/];
        }
    });
}); });
router.delete("/api/users/delete", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, deleteSuccess, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.deleteUser(id)];
            case 1:
                deleteSuccess = _a.sent();
                if (deleteSuccess) {
                    return [2 /*return*/, res.status(200).json({
                            message: "User deleted successfully!",
                        })];
                }
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.get("/api/users/current", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, currentUser, err_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.userId // req.mail should be decoded user mail
                ;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.findByID(id)];
            case 1:
                currentUser = _a.sent();
                if (!currentUser) {
                    return [2 /*return*/, res.status(404).json({
                            message: "User not found!",
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        user: currentUser,
                        message: "User found!",
                    })];
            case 2:
                err_4 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.patch("/api/users/update/name", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, name_1, updateSuccess, err_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                name_1 = req.body.name;
                if (typeof name_1 !== "string") {
                    return [2 /*return*/, res.status(400).json({
                            message: "Invalid name format!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.updateName(name_1, id)];
            case 1:
                updateSuccess = _a.sent();
                if (!updateSuccess) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Name could not be updated!",
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        message: "Name successfully updated!",
                    })];
            case 2:
                err_5 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.patch("/api/users/update/username", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, username, existingUser, updateSuccess, err_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                username = req.body.username;
                if (typeof username !== "string") {
                    return [2 /*return*/, res.status(400).json({
                            message: "Invalid username format!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.findByUsername(username)];
            case 1:
                existingUser = _a.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(409).json({
                            message: "Username already in use!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.updateUsername(username, id)];
            case 2:
                updateSuccess = _a.sent();
                if (!updateSuccess) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Username could not be updated!",
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        message: "Username successfully updated!",
                    })];
            case 3:
                err_6 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.patch("/api/users/update/institution", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, institution, updateSuccess, err_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                institution = req.body.institution;
                if (typeof institution !== "string") {
                    return [2 /*return*/, res.status(400).json({
                            message: "Invalid institution format!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.updateInstitution(institution, id)];
            case 1:
                updateSuccess = _a.sent();
                if (!updateSuccess) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Institution could not be updated!",
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        message: "Institution successfully updated!",
                    })];
            case 2:
                err_7 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.patch("/api/users/update/email", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, newMail, existingMail, updateSuccess, err_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                newMail = req.body.newMail;
                return [4 /*yield*/, user_service_sqlite_1.default.findByMail(newMail)];
            case 1:
                existingMail = _a.sent();
                if (existingMail) {
                    return [2 /*return*/, res.status(409).json({
                            message: "Email already in use!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.updateMail(newMail, id)];
            case 2:
                updateSuccess = _a.sent();
                if (!updateSuccess) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Email could not be updated!",
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        message: "Email successfully updated!",
                    })];
            case 3:
                err_8 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error.")];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.patch("/api/users/update/password", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, _a, newPass, oldPass, isPasswordValid, newHashedPass, updateSuccess, err_9;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.findByID(id)];
            case 1:
                user = _b.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                _a = req.body, newPass = _a.newPass, oldPass = _a.oldPass;
                return [4 /*yield*/, bcrypt_1.default.compare(oldPass, user.password)];
            case 2:
                isPasswordValid = _b.sent();
                if (!isPasswordValid) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Invalid password!",
                        })];
                }
                return [4 /*yield*/, bcrypt_1.default.hash(newPass, 10)];
            case 3:
                newHashedPass = _b.sent();
                return [4 /*yield*/, user_service_sqlite_1.default.updatePassword(newHashedPass, id)];
            case 4:
                updateSuccess = _b.sent();
                if (!updateSuccess) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Password could not be updated!",
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        message: "Password successfully updated!",
                    })];
            case 5:
                err_9 = _b.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 6: return [2 /*return*/];
        }
    });
}); });
router.post("/api/users/authpass", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, user, password, isPasswordValid, err_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                return [4 /*yield*/, user_service_sqlite_1.default.findByID(id)];
            case 1:
                user = _a.sent();
                if (!user) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                password = req.body.password;
                return [4 /*yield*/, bcrypt_1.default.compare(password, user.password)];
            case 2:
                isPasswordValid = _a.sent();
                if (!isPasswordValid) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Invalid password!",
                        })];
                }
                else {
                    return [2 /*return*/, res.status(200).json({
                            message: "Password authenticated!",
                        })];
                }
                return [3 /*break*/, 4];
            case 3:
                err_10 = _a.sent();
                return [2 /*return*/, res.status(500).send("Internal Server Error!")];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/api/users/authtoken", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        try {
            id = req.userId;
            if (!id) {
                return [2 /*return*/, res.status(401).json({
                        message: "Unauthorized access!",
                    })];
            }
            return [2 /*return*/, res.status(200).json({
                    message: "Token authenticated!",
                })];
        }
        catch (err) {
            return [2 /*return*/, res.status(500).send("Internal Server Error!")];
        }
        return [2 /*return*/];
    });
}); });
router.post("/api/users/update/img", user_service_sqlite_1.default.authenticateToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, signParams, signature, imgFile, formData, cloudinaryRes, imgurl, updateSuccess, err_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.userId;
                if (!id) {
                    return [2 /*return*/, res.status(401).json({
                            message: "Unauthorized access!",
                        })];
                }
                if (!req.files || Object.keys(req.files).length === 0) {
                    return [2 /*return*/, res.status(400).json({
                            message: "Img file could not be found!",
                        })];
                }
                signParams = {
                    timestamp: Math.round(new Date().getTime() / 1000),
                    eager: "g_face,c_crop,ar_1:1,z_0.9/w_400,h_400",
                    public_id: "users/avatars/".concat(req.userId),
                };
                signature = cloudinary_1.v2.utils.api_sign_request(signParams, config_1.CLOUDINARY_CONFIG.api_secret);
                if (typeof signature !== "string") {
                    throw new Error("Error generating Cloudinary signature!");
                }
                imgFile = req.files.image;
                formData = new form_data_1.default();
                formData.append("file", imgFile.data, {
                    filename: imgFile.name,
                    contentType: imgFile.mimetype,
                });
                formData.append("timestamp", signParams.timestamp.toString());
                formData.append("eager", signParams.eager);
                formData.append("public_id", signParams.public_id);
                formData.append("signature", signature);
                formData.append("api_key", config_1.CLOUDINARY_CONFIG.api_key);
                return [4 /*yield*/, axios_1.default.post("https://api.cloudinary.com/v1_1/".concat(config_1.CLOUDINARY_CONFIG.cloud_name, "/image/upload"), formData, {
                        headers: __assign({}, formData.getHeaders()),
                    })];
            case 1:
                cloudinaryRes = _a.sent();
                imgurl = cloudinaryRes.data.eager[0].secure_url;
                updateSuccess = user_service_sqlite_1.default.updateImgUrl(imgurl, id);
                if (!updateSuccess) {
                    return [2 /*return*/, res.status(400).json({
                            message: "User image could not be updated!"
                        })];
                }
                return [2 /*return*/, res.status(200).json({
                        message: "User image successfully updated!"
                    })];
            case 2:
                err_11 = _a.sent();
                if (err_11.response) {
                    console.error("error:", err_11.response.data);
                    return [2 /*return*/, res.status(err_11.response.status).json({
                            message: err_11.message
                        })];
                }
                return [2 /*return*/, res.status(500).json("Internal server error!")];
            case 3: return [2 /*return*/];
        }
    });
}); });
// Additional API endpoints for updating, deleting users, etc.
exports.default = router;
