import Joi from 'joi';

export const paginationSchemaDefine = Joi.object({
    limit: Joi.number().integer().min(1).default(10).description('max in every page'),
    page: Joi.number().integer().min(1).default(1).description('page number'),
    pagination: Joi.boolean().description('turn on or tunr off the pagination, default is on'),
});

export const jwtHeadersSchemaDefine = Joi.object({
    authorization: Joi.string().required(),
}).unknown();
