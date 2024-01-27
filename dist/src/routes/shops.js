"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const Shop_1 = __importDefault(require("../../models/Shop"));
const Good_1 = __importDefault(require("../../models/Good"));
const router_helper_1 = require("../utils/router-helper");
const GROUP_NAME = 'shops';
const paramsSchema = joi_1.default.object({
    shopId: joi_1.default.string().min(1).max(50).required(),
});
const shopsRoutes = [
    {
        method: `GET`,
        path: `/${GROUP_NAME}`,
        options: {
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const { limit, page } = request.query;
                const validationQueryResult = router_helper_1.paginationSchemaDefine.validate({ limit, page });
                if (validationQueryResult.error) {
                    return h.response('Invalid route query').code(400);
                }
                const { authorization } = request.headers;
                const validationHeadersResult = router_helper_1.jwtHeadersSchemaDefine.validate({ authorization });
                if (validationHeadersResult.error) {
                    return h.response('Invalid route headers').code(400);
                }
                const { rows: results, count: totalCount } = yield Shop_1.default.findAndCountAll({
                    attributes: ['id', 'name'],
                    limit: request.query.limit,
                    offset: (request.query.page - 1) * request.query.limit,
                });
                return h.response({ results, totalCount });
            }),
            tags: [`api`, GROUP_NAME],
            description: `get the list of vendor`,
            notes: `get the list of vendor`,
            validate: {
                query: router_helper_1.paginationSchemaDefine,
                headers: router_helper_1.jwtHeadersSchemaDefine,
            },
        },
    },
    {
        method: `GET`,
        path: `/${GROUP_NAME}/{shopId}/goods`,
        options: {
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const { shopId } = request.params;
                const validationResult = paramsSchema.validate({ shopId });
                if (validationResult.error) {
                    return h.response('Invalid route parameters').code(400);
                }
                const { rows: results, count: totalCount } = yield Good_1.default.findAndCountAll({
                    where: {
                        shop_id: request.params.shopId,
                    },
                    attributes: ['id', 'name'],
                    limit: request.query.limit,
                    offset: (request.query.page - 1) * request.query.limit,
                });
                return h.response({ results, totalCount });
            }),
            tags: [`api`, GROUP_NAME],
            description: `get the list of goods of a vendor`,
            notes: `get the list of goods of a vendor`,
            validate: {
                params: paramsSchema,
                headers: router_helper_1.jwtHeadersSchemaDefine,
            },
            auth: false,
        },
    },
];
exports.default = shopsRoutes;
