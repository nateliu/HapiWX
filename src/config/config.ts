import dotenv from 'dotenv';

dotenv.config({path: './.env'});

const {env} = process;

const config = {
    server: {
        port: env.PORT,
        host: env.HOST,
    },
    jwtSecret: env.JWT_SECRET,
    wxAppid: env.WX_APPID,
    wxSecret: env.WX_APP_SECRET,
    wxMchid: env.WX_MCHID,
    wxPayApiKey: env.WX_PAY_API_KEY,
};

export default config;
