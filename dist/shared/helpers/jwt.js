"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const generateToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.config.JWT_SECRET, {
        expiresIn: config_1.config.JWT_EXPIRES_IN,
    });
};
exports.generateToken = generateToken;
const generateRefreshToken = (payload) => {
    return jsonwebtoken_1.default.sign(payload, config_1.config.JWT_REFRESH_SECRET, {
        expiresIn: config_1.config.JWT_REFRESH_EXPIRES_IN,
    });
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.JWT_SECRET);
};
exports.verifyToken = verifyToken;
const verifyRefreshToken = (token) => {
    return jsonwebtoken_1.default.verify(token, config_1.config.JWT_REFRESH_SECRET);
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.js.map