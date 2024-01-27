import Hapi from '@hapi/hapi';
import JWT from 'jsonwebtoken';
import config from '../config/config';
import decryptData from '../utils/decrypt-data';
import Joi from 'joi';
import axios from 'axios';
import User from '../../models/User';

interface JwtInfo {
    userId: number;
}

interface Payload {
    code: string;
    encryptedData: string;
    iv: string;
    appid?: string;
    sessionKey?: string;
}

const GROUP_NAME = 'users';

const payloadSchema = Joi.object({
    code: Joi.string().required().description('Wechat user login temporary code'),
    encryptedData: Joi.string().required().description('Wechat user encryptedData'),
    iv: Joi.string().required().description('Wechat user iv'),
    appid: Joi.string()
        .optional()
        .description('Wechat appid, can ignore, its used for swagger testing'),
    sessionKey: Joi.string()
        .optional()
        .description('Wechat sessionKey, can ignore, its used for swagger testing'),
});

const usersRoutes: Hapi.ServerRoute[] = [
    {
        method: `POST`,
        path: `/${GROUP_NAME}/createJWT`,
        options: {
            handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                const generateJWT = (jwtInfo: JwtInfo) => {
                    const payload = {
                        userId: jwtInfo.userId,
                        exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
                    };
                    return JWT.sign(payload, config.jwtSecret!);
                };

                // hardcode the userId is 1
                return h.response(generateJWT({userId: 1}));
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
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            const appid = config.wxAppid!;
            const secret = config.wxSecret!;
            const {code, encryptedData, iv} = request.payload as Payload;

            const response = await axios({
                url: 'https://api.weixin.qq.com/sns/jscode2session',
                method: 'GET',
                params: {
                    appid,
                    secret,
                    js_code: code,
                    grant_type: 'authorization_code',
                },
            });

            const {openid, session_key: sessionKey} = response.data;

            const user = await User.findOrCreate({
                where: {open_id: openid},
            });

            const userInfo = decryptData(encryptedData, iv, sessionKey, appid);

            await User.update(
                {
                    nick_name: userInfo.nickName,
                    gender: userInfo.gender,
                    avatar_url: userInfo.avatarUrl,
                    open_id: openid,
                    session_key: sessionKey,
                },
                {
                    where: {open_id: openid},
                },
            );

            // signature JWT
            const generateJWT = (jwtInfo: JwtInfo) => {
                const payload = {
                    userId: jwtInfo.userId,
                    exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
                };
                return JWT.sign(payload, config.jwtSecret!);
            };

            return h.response(
                generateJWT({
                    userId: user[0].id,
                }),
            );
        },
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
        handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
            const {code, encryptedData, iv, appid, sessionKey} = request.payload as Payload;
            const userInfo = decryptData(encryptedData, iv, sessionKey ?? '', appid ?? '');

            return h.response(userInfo);
        },
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

export default usersRoutes;
