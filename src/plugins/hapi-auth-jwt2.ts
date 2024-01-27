import Hapi from '@hapi/hapi';
import config from '../config/config';

interface Decoded {
    userId: number;
}

const validate = (decoded: Decoded, request: Hapi.Request, h: Hapi.ResponseToolkit) => {
    /*
      interface POST /users/createJWT signature rule
  
      const payload = {
        userId: jwtInfo.userId,
        exp: Math.floor(new Date().getTime() / 1000) + 7 * 24 * 60 * 60,
      };
      return JWT.sign(payload, 'my-jwt-secret');
    */

    const {userId} = decoded;
    const credentials = {userId};

    if (!userId) {
        return {isValid: false, credentials: {}};
    } else {
        return {isValid: true, credentials};
    }
};

const hapiAuthJWT2Plugin = (server: Hapi.Server) => {
    server.auth.strategy('jwt', 'jwt', {
        key: config.jwtSecret,
        validate,
    });
    server.auth.default('jwt');
};

export default hapiAuthJWT2Plugin;
