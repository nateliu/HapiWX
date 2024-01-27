"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("../config/config"));
const validate = (decoded, request, h) => {
    /*
      interface POST /users/createJWT signature rule
  
      const payload = {
        userId: jwtInfo.userId,
        exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
      };
      return JWT.sign(payload, 'my-jwt-secret');
    */
    const { userId } = decoded;
    const credentials = { userId };
    if (!userId) {
        return { isValid: false, credentials: {} };
    }
    else {
        return { isValid: true, credentials };
    }
};
const hapiAuthJWT2Plugin = (server) => {
    server.auth.strategy('jwt', 'jwt', {
        key: config_1.default.jwtSecret,
        validate,
    });
    server.auth.default('jwt');
};
exports.default = hapiAuthJWT2Plugin;
