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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = __importDefault(require("../config/config"));
const decrypt_data_1 = __importDefault(require("../utils/decrypt-data"));
const joi_1 = __importDefault(require("joi"));
const axios_1 = __importDefault(require("axios"));
const User_1 = __importDefault(require("../../models/User"));
const GROUP_NAME = 'users';
const payloadSchema = joi_1.default.object({
    code: joi_1.default.string().required().description('Wechat user login temporary code'),
    encryptedData: joi_1.default.string().required().description('Wechat user encryptedData'),
    iv: joi_1.default.string().required().description('Wechat user iv'),
    appid: joi_1.default.string()
        .optional()
        .description('Wechat appid, can ignore, its used for swagger testing'),
    sessionKey: joi_1.default.string()
        .optional()
        .description('Wechat sessionKey, can ignore, its used for swagger testing'),
});
const usersRoutes = [
    {
        method: `POST`,
        path: `/${GROUP_NAME}/createJWT`,
        options: {
            handler: (request, h) => {
                const generateJWT = (jwtInfo) => {
                    const payload = {
                        userId: jwtInfo.userId,
                        exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
                    };
                    return jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret);
                };
                // hardcode the userId is 1
                return h.response(generateJWT({ userId: 1 }));
            },
            tags: [`api`, GROUP_NAME],
            description: `create a JWT for testing`,
            notes: `create a JWT for testing`,
            auth: false,
        },
    },
    {
        method: 'POST',
        path: `/${GROUP_NAME}/wxLogin`,
        handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
            const appid = config_1.default.wxAppid;
            const secret = config_1.default.wxSecret;
            const { code, encryptedData, iv } = request.payload;
            const response = yield (0, axios_1.default)({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                method: 'GET',
                params: {
                    appid,
                    secret,
                    js_code: code,
                    grant_type: 'authorization_code',
                },
            });
            const { openid, session_key: sessionKey } = response.data;
            const user = yield User_1.default.findOrCreate({
                where: { open_id: openid },
            });
            const userInfo = (0, decrypt_data_1.default)(encryptedData, iv, sessionKey, appid);
            yield User_1.default.update({
                nick_name: userInfo.nickName,
                gender: userInfo.gender,
                avatar_url: userInfo.avatarUrl,
                open_id: openid,
                session_key: sessionKey,
            }, {
                where: { open_id: openid },
            });
            // signature JWT
            const generateJWT = (jwtInfo) => {
                const payload = {
                    userId: jwtInfo.userId,
                    exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
                };
                return jsonwebtoken_1.default.sign(payload, config_1.default.jwtSecret);
            };
            return h.response(generateJWT({
                userId: user[0].id,
            }));
        }),
        options: {
            auth: false,
            tags: [`api`, GROUP_NAME],
            description: `Wechat mini program login`,
            notes: `Wechat mini program login`,
            validate: {
                payload: payloadSchema,
            },
        },
    },
    {
        method: 'POST',
        path: `/${GROUP_NAME}/decrypto`,
        handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
            const { code, encryptedData, iv, appid, sessionKey } = request.payload;
            const userInfo = (0, decrypt_data_1.default)(encryptedData, iv, sessionKey !== null && sessionKey !== void 0 ? sessionKey : '', appid !== null && appid !== void 0 ? appid : '');
            return h.response(userInfo);
        }),
        options: {
            auth: false,
            tags: [`api`, GROUP_NAME],
            description: `aes-128-cbc decryption testing`,
            notes: `aes-128-cbc decryption testing`,
            validate: {
                payload: payloadSchema,
            },
        },
    },
];
exports.default = usersRoutes;
