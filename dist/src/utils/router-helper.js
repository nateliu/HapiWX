"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtHeadersSchemaDefine = exports.paginationSchemaDefine = void 0;
const joi_1 = __importDefault(require("joi"));
exports.paginationSchemaDefine = joi_1.default.object({
    limit: joi_1.default.number().integer().min(1).default(10).description('max in every page'),
    page: joi_1.default.number().integer().min(1).default(1).description('page number'),
    pagination: joi_1.default.boolean().description('turn on or tunr off the pagination, default is on'),
});
exports.jwtHeadersSchemaDefine = joi_1.default.object({
    authorization: joi_1.default.string().required(),
}).unknown();
