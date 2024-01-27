import Hapi from '@hapi/hapi';
import Joi, {any} from 'joi';
import {jwtHeadersSchemaDefine} from '../utils/router-helper';
import sequelize from '../../models';
import Order from '../../models/Order';
import OrderGood from '../../models/OrderGood';
import User from '../../models/User';
import config from '../config/config';
import axios from 'axios';
import xml2js from 'xml2js';
import crypto from 'crypto';

const GROUP_NAME = 'orders';

const paramsSchema = Joi.object({
    orderId: Joi.string().min(1).max(50).required(),
});

const payloadSchema = Joi.object({
    goodsList: Joi.array().items(
        Joi.object().keys({
            goods_id: Joi.number().integer(),
            count: Joi.number().integer(),
        }),
    ),
});

const ordersRoutes: Hapi.ServerRoute[] = [
    {
        method: `POST`,
        path: `/${GROUP_NAME}`,
        options: {
            handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                const {goodsList} = <{goodsList: any}>request.payload;
                const validationPayloadResult = payloadSchema.validate({goodsList});
                if (validationPayloadResult.error) {
                    return h.response('Invalid route payload').code(400);
                }

                try {
                    const result = await sequelize.transaction(async (t) => {
                        const order = await Order.create(
                            {user_id: request.auth.credentials.userId},
                            {transaction: t},
                        );

                        const goodsPromises = goodsList.map((item: any) => {
                            return OrderGood.create(
                                {
                                    order_id: order.dataValues.id,
                                    goods_id: item.goods_id,
                                    // had better to get the price from the goods table, here just hardcode
                                    single_price: 4.9,
                                    count: item.count,
                                },
                                {transaction: t},
                            );
                        });

                        return await Promise.all(goodsPromises);
                    });

                    return h.response({message: 'success', data: result});
                } catch (error) {
                    return h.response({message: 'error'});
                }
            },
            validate: {
                payload: payloadSchema,
                headers: jwtHeadersSchemaDefine,
            },
            tags: [`api`, GROUP_NAME],
            description: `create a order`,
            notes: `create a order`,
        },
    },
    {
        method: `POST`,
        path: `/${GROUP_NAME}/{orderId}/pay`,
        options: {
            handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                const {orderId} = request.params;
                const validationResult = paramsSchema.validate({orderId});
                if (validationResult.error) {
                    return h.response('Invalid route parameters').code(400);
                }

                const user = await User.findOne({where: {id: request.auth.credentials.userId}});
                const open_id = user?.open_id;
                // wrap a unique unifiedorder
                const unifiedorderObj = {
                    appid: config.wxAppid,
                    body: 'Description for the good',
                    mch_id: config.wxMchid,
                    nonce_str: Math.random().toString(36).substr(2, 15), // random string
                    notify_url: 'https://yourhost.com/orders/pay/notify', // callback url, after the payment is successful, WePay will send a notification to this url, here just use a fake url
                    open_id, // user open_id
                    out_trade_no: request.params.orderId, // order id
                    spbill_create_ip: request.info.remoteAddress, // client ip
                    total_fee: 1, // total amount，unit is fen
                    trade_type: 'JSAPI', // trade type
                };

                // wrap a function to get the sign data
                const getSignData = (rawData: any, apiKey: any) => {
                    let keys = Object.keys(rawData);
                    keys = keys.sort();
                    let string = '';
                    keys.forEach((key) => {
                        string += `&${key}=${rawData[key]}`;
                    });
                    string = string.substr(1);
                    return crypto
                        .createHash('md5')
                        .update(`${string}&key=${apiKey}`)
                        .digest('hex')
                        .toUpperCase();
                };

                // sign the basic data
                const sign = getSignData(unifiedorderObj, config.wxPayApiKey);

                // wrap the data to be posted
                const unifiedorderWithSign = {
                    ...unifiedorderObj,
                    sign,
                };

                // convert the post data to xml format
                const builder = new xml2js.Builder({rootName: 'xml', headless: true});
                const unifiedorderXML = builder.buildObject(unifiedorderWithSign);
                const result = await axios({
                    url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
                    method: 'POST',
                    data: unifiedorderXML,
                    headers: {'content-type': 'text/xml'},
                });

                // convert response to json object and return to front end
                xml2js.parseString(result.data, (err, parsedResult) => {
                    if (parsedResult.xml) {
                        if (
                            parsedResult.xml.return_code[0] === 'SUCCESS' &&
                            parsedResult.xml.result_code[0] === 'SUCCESS'
                        ) {
                            // Raw payment data to be signed
                            const replyData: any = {
                                appId: parsedResult.xml.appid[0],
                                timeStamp: (Date.now() / 1000).toString(),
                                nonceStr: parsedResult.xml.nonce_str[0],
                                package: `prepay_id=${parsedResult.xml.prepay_id[0]}`,
                                signType: 'MD5',
                            };
                            replyData.paySign = getSignData(replyData, config.wxPayApiKey);
                            return h.response(replyData);
                        }
                    }
                });
            },
            validate: {
                params: paramsSchema,
                headers: jwtHeadersSchemaDefine,
            },
            tags: [`api`, GROUP_NAME],
            description: `pay for a order`,
            notes: `pay for a order`,
        },
    },
    {
        method: 'POST',
        path: `/${GROUP_NAME}/pay/notify`,
        options: {
            handler: async (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
                const {xml} = request.payload as any;
                const json = `<xml>
        <appid><![CDATA[wx2421b1c4370ec43b]]></appid>
        <attach><![CDATA[支付测试]]></attach>
        <bank_type><![CDATA[CFT]]></bank_type>
        <fee_type><![CDATA[CNY]]></fee_type>
        <is_subscribe><![CDATA[N]]></is_subscribe>
        <mch_id><![CDATA[10000100]]></mch_id>
        <nonce_str><![CDATA[5d2b6c2a8db53831f7eda20af46e531c]]></nonce_str>
        <openid><![CDATA[oUpF8uMEb4qRXf22hE3X68TekukE]]></openid>
        <out_trade_no><![CDATA[8]]></out_trade_no>
        <result_code><![CDATA[SUCCESS]]></result_code>
        <return_code><![CDATA[SUCCESS]]></return_code>
        <sign><![CDATA[B552ED6B279343CB493C5DD0D78AB241]]></sign>
        <time_end><![CDATA[20140903131540]]></time_end>
        <total_fee>1</total_fee>
        <coupon_fee><![CDATA[10]]></coupon_fee>
        <coupon_count><![CDATA[1]]></coupon_count>
        <coupon_type><![CDATA[CASH]]></coupon_type>
        <coupon_id><![CDATA[10000]]></coupon_id>
        <trade_type><![CDATA[JSAPI]]></trade_type>
        <transaction_id><![CDATA[1004400740201409030005092168]]></transaction_id>
      </xml>`;
                return new Promise((resolve, reject) => {
                    xml2js.parseString(xml ?? json, async (err, parsedResult) => {
                        if (err) {
                            reject(err);
                        } else {
                            if (parsedResult.xml.return_code[0] === 'SUCCESS') {
                                // If the status is SUCCESS, then update the order status to paid
                                // change the payment_status = 1
                                const orderId = parsedResult.xml.out_trade_no[0];
                                const orderResult: any = await Order.findOne({
                                    where: {id: orderId},
                                });
                                orderResult.payment_status = '1';
                                await orderResult.save();

                                // return success to WePay
                                const retVal = {
                                    return_code: 'SUCCESS',
                                    return_msg: 'OK',
                                };
                                const builder = new xml2js.Builder({
                                    rootName: 'xml',
                                    headless: true,
                                });

                                resolve(h.response(builder.buildObject(retVal)));
                            }
                        }
                    });
                });
            },
            validate: {
                payload: Joi.object()
                    .required()
                    .description(
                        `https://codebeautify.org/multiline-to-single-line, use pattern: {"xml": "xml content here"}`,
                    ),
            },
            tags: ['api', GROUP_NAME],
            description: `send notification if WePay is successful`,
            notes: `send notification if WePay is successful`,
            auth: false,
        },
    },
];

export default ordersRoutes;
