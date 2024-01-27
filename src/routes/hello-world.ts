import Hapi from '@hapi/hapi';
import {jwtHeadersSchemaDefine} from '../utils/router-helper';

const GROUP_NAME = 'welcome';

const helloWoldRoutes: Hapi.ServerRoute[] = [
    {
        method: 'GET',
        path: '/hello-world',
        options: {
            handler: (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                return h.response(
                    `Hello, world! and the credential includes ${JSON.stringify(request.auth.credentials)}`,
                );
            },
            tags: [`api`, GROUP_NAME],
            description: `welcome to the hapi world`,
            notes: `welcome to the hapi world`,
            validate: {
                headers: jwtHeadersSchemaDefine,
            },
        },
    },
];

export default helloWoldRoutes;
