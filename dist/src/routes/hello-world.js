"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const router_helper_1 = require("../utils/router-helper");
const GROUP_NAME = 'welcome';
const helloWoldRoutes = [
    {
        method: 'GET',
        path: '/hello-world',
        options: {
            handler: (request, h) => {
                return h.response(`Hello, world! and the credential includes ${JSON.stringify(request.auth.credentials)}`);
            },
            tags: [`api`, GROUP_NAME],
            description: `welcome to the hapi world`,
            notes: `welcome to the hapi world`,
            validate: {
                headers: router_helper_1.jwtHeadersSchemaDefine,
            },
        },
    },
];
exports.default = helloWoldRoutes;
