import Hapi from '@hapi/hapi';
import Inert from '@hapi/inert';
import Vision from '@hapi/vision';
import HapiSwagger from 'hapi-swagger';

const packageInfo = require('../../package.json');

const swaggerOptions: HapiSwagger.RegisterOptions = {
    info: {
        title: 'HapiWX API Documentation',
        version: packageInfo.version,
        contact: {
            email: 'jinliangliu@163.com',
        },
    },
};

const happiSwaggerPlugin: Array<Hapi.ServerRegisterPluginObject<any>> = [
    {
        plugin: Inert,
    },
    {
        plugin: Vision,
    },
    {
        plugin: HapiSwagger,
        options: swaggerOptions,
    },
];

export default happiSwaggerPlugin;
