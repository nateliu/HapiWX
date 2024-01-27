import Hapi from '@hapi/hapi';
import Joi from 'joi';
import Shop from '../../models/Shop';
import Good from '../../models/Good';
import {jwtHeadersSchemaDefine, paginationSchemaDefine} from '../utils/router-helper';

const GROUP_NAME = 'shops';

const paramsSchema = Joi.object({
    shopId: Joi.string().min(1).max(50).required(),
});

const shopsRoutes: Hapi.ServerRoute[] = [
    {
        method: `GET`,
        path: `/${GROUP_NAME}`,
        options: {
            handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                const {limit, page} = <{limit: number; page: number}>request.query;
                const validationQueryResult = paginationSchemaDefine.validate({limit, page});
                if (validationQueryResult.error) {
                    return h.response('Invalid route query').code(400);
                }

                const {authorization} = <{authorization: string}>request.headers;
                const validationHeadersResult = jwtHeadersSchemaDefine.validate({authorization});
                if (validationHeadersResult.error) {
                    return h.response('Invalid route headers').code(400);
                }

                const {rows: results, count: totalCount} = await Shop.findAndCountAll({
                    attributes: ['id', 'name'],
                    limit: request.query.limit,
                    offset: (request.query.page - 1) * request.query.limit,
                });

                return h.response({results, totalCount});
            },
            tags: [`api`, GROUP_NAME],
            description: `get the list of vendor`,
            notes: `get the list of vendor`,
            validate: {
                query: paginationSchemaDefine,
                headers: jwtHeadersSchemaDefine,
            },
        },
    },
    {
        method: `GET`,
        path: `/${GROUP_NAME}/{shopId}/goods`,
        options: {
            handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                const {shopId} = request.params;
                const validationResult = paramsSchema.validate({shopId});
                if (validationResult.error) {
                    return h.response('Invalid route parameters').code(400);
                }

                const {rows: results, count: totalCount} = await Good.findAndCountAll({
                    where: {
                        shop_id: request.params.shopId,
                    },
                    attributes: ['id', 'name'],
                    limit: request.query.limit,
                    offset: (request.query.page - 1) * request.query.limit,
                });

                return h.response({results, totalCount});
            },
            tags: [`api`, GROUP_NAME],
            description: `get the list of goods of a vendor`,
            notes: `get the list of goods of a vendor`,
            validate: {
                params: paramsSchema,
                headers: jwtHeadersSchemaDefine,
            },
            auth: false,
        },
    },
];

export default shopsRoutes;
