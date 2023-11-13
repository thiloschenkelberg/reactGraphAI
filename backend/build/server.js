"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var user_controller_mongodb_1 = __importDefault(require("./controllers/user.controller-mongodb"));
var cors_1 = __importDefault(require("cors"));
var app = (0, express_1.default)();
var port = process.env.PORT || 8080; // Set the desired port number
// Middleware
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// API routes
app.use(user_controller_mongodb_1.default); // Mount the user routes
app.get("/api/test", function (req, res) {
    try {
        res.send("jello");
    }
    catch (err) {
        return res.status(500).send(err.message);
    }
});
// // Start the server (local)
app.listen(port, function () {
    console.log("Server is running on port ".concat(port));
});
