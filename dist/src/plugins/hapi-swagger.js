"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const inert_1 = __importDefault(require("@hapi/inert"));
const vision_1 = __importDefault(require("@hapi/vision"));
const hapi_swagger_1 = __importDefault(require("hapi-swagger"));
const packageInfo = require('../../package.json');
const swaggerOptions = {
    info: {
        title: 'HapiWX API Documentation',
        version: packageInfo.version,
        contact: {
            email: 'jinliangliu@163.com',
        },
    },
};
const happiSwaggerPlugin = [
    {
        plugin: inert_1.default,
    },
    {
        plugin: vision_1.default,
    },
    {
        plugin: hapi_swagger_1.default,
        options: swaggerOptions,
    },
];
exports.default = happiSwaggerPlugin;
