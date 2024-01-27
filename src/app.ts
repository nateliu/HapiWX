import Hapi from '@hapi/hapi';
import HapiAuthJWT2 from 'hapi-auth-jwt2';
import helloWoldRoutes from './routes/hello-world';
import config from './config/config';
import happiSwaggerPlugin from './plugins/hapi-swagger';
import hapiPaginationPlugin from './plugins/hapi-pagination';
import shopsRoutes from './routes/shops';
import ordersRoutes from './routes/orders';
import usersRoutes from './routes/users';
import hapiAuthJWT2Plugin from './plugins/hapi-auth-jwt2';

const init = async () => {
    const server = Hapi.server({
        port: config.server.port,
        host: config.server.host,
    });

    await server.register([...happiSwaggerPlugin, ...hapiPaginationPlugin]);

    await server.register(HapiAuthJWT2);
    hapiAuthJWT2Plugin(server);

    server.route([...helloWoldRoutes, ...shopsRoutes, ...ordersRoutes, ...usersRoutes]);

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();
