"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const router_helper_1 = require("../utils/router-helper");
const models_1 = __importDefault(require("../../models"));
const Order_1 = __importDefault(require("../../models/Order"));
const OrderGood_1 = __importDefault(require("../../models/OrderGood"));
const User_1 = __importDefault(require("../../models/User"));
const config_1 = __importDefault(require("../config/config"));
const axios_1 = __importDefault(require("axios"));
const xml2js_1 = __importDefault(require("xml2js"));
const crypto_1 = __importDefault(require("crypto"));
const GROUP_NAME = 'orders';
const paramsSchema = joi_1.default.object({
    orderId: joi_1.default.string().min(1).max(50).required(),
});
const payloadSchema = joi_1.default.object({
    goodsList: joi_1.default.array().items(joi_1.default.object().keys({
        goods_id: joi_1.default.number().integer(),
        count: joi_1.default.number().integer(),
    })),
});
const ordersRoutes = [
    {
        method: `POST`,
        path: `/${GROUP_NAME}`,
        options: {
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const { goodsList } = request.payload;
                const validationPayloadResult = payloadSchema.validate({ goodsList });
                if (validationPayloadResult.error) {
                    return h.response('Invalid route payload').code(400);
                }
                try {
                    const result = yield models_1.default.transaction((t) => __awaiter(void 0, void 0, void 0, function* () {
                        const order = yield Order_1.default.create({ user_id: request.auth.credentials.userId }, { transaction: t });
                        const goodsPromises = goodsList.map((item) => {
                            return OrderGood_1.default.create({
                                order_id: order.dataValues.id,
                                goods_id: item.goods_id,
                                // had better to get the price from the goods table, here just hardcode
                                single_price: 4.9,
                                count: item.count,
                            }, { transaction: t });
                        });
                        return yield Promise.all(goodsPromises);
                    }));
                    return h.response({ message: 'success', data: result });
                }
                catch (error) {
                    return h.response({ message: 'error' });
                }
            }),
            validate: {
                payload: payloadSchema,
                headers: router_helper_1.jwtHeadersSchemaDefine,
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
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const { orderId } = request.params;
                const validationResult = paramsSchema.validate({ orderId });
                if (validationResult.error) {
                    return h.response('Invalid route parameters').code(400);
                }
                const user = yield User_1.default.findOne({ where: { id: request.auth.credentials.userId } });
                const open_id = user === null || user === void 0 ? void 0 : user.open_id;
                // wrap a unique unifiedorder
                const unifiedorderObj = {
                    appid: config_1.default.wxAppid,
                    body: 'Description for the good',
                    mch_id: config_1.default.wxMchid,
                    nonce_str: Math.random().toString(36).substr(2, 15), // random string
                    notify_url: 'https://yourhost.com/orders/pay/notify', // callback url, after the payment is successful, WePay will send a notification to this url, here just use a fake url
                    open_id, // user open_id
                    out_trade_no: request.params.orderId, // order id
                    spbill_create_ip: request.info.remoteAddress, // client ip
                    total_fee: 1, // total amount，unit is fen
                    trade_type: 'JSAPI', // trade type
                };
                // wrap a function to get the sign data
                const getSignData = (rawData, apiKey) => {
                    let keys = Object.keys(rawData);
                    keys = keys.sort();
                    let string = '';
                    keys.forEach((key) => {
                        string += `&${key}=${rawData[key]}`;
                    });
                    string = string.substr(1);
                    return crypto_1.default
                        .createHash('md5')
                        .update(`${string}&key=${apiKey}`)
                        .digest('hex')
                        .toUpperCase();
                };
                // sign the basic data
                const sign = getSignData(unifiedorderObj, config_1.default.wxPayApiKey);
                // wrap the data to be posted
                const unifiedorderWithSign = Object.assign(Object.assign({}, unifiedorderObj), { sign });
                // convert the post data to xml format
                const builder = new xml2js_1.default.Builder({ rootName: 'xml', headless: true });
                const unifiedorderXML = builder.buildObject(unifiedorderWithSign);
                const result = yield (0, axios_1.default)({
                    url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
                    method: 'POST',
                    data: unifiedorderXML,
                    headers: { 'content-type': 'text/xml' },
                });
                // convert response to json object and return to front end
                xml2js_1.default.parseString(result.data, (err, parsedResult) => {
                    if (parsedResult.xml) {
                        if (parsedResult.xml.return_code[0] === 'SUCCESS' &&
                            parsedResult.xml.result_code[0] === 'SUCCESS') {
                            // Raw payment data to be signed
                            const replyData = {
                                appId: parsedResult.xml.appid[0],
                                timeStamp: (Date.now() / 1000).toString(),
                                nonceStr: parsedResult.xml.nonce_str[0],
                                package: `prepay_id=${parsedResult.xml.prepay_id[0]}`,
                                signType: 'MD5',
                            };
                            replyData.paySign = getSignData(replyData, config_1.default.wxPayApiKey);
                            return h.response(replyData);
                        }
                    }
                });
            }),
            validate: {
                params: paramsSchema,
                headers: router_helper_1.jwtHeadersSchemaDefine,
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
            handler: (request, h) => __awaiter(void 0, void 0, void 0, function* () {
                const { xml } = request.payload;
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
                    xml2js_1.default.parseString(xml !== null && xml !== void 0 ? xml : json, (err, parsedResult) => __awaiter(void 0, void 0, void 0, function* () {
                        if (err) {
                            reject(err);
                        }
                        else {
                            if (parsedResult.xml.return_code[0] === 'SUCCESS') {
                                // If the status is SUCCESS, then update the order status to paid
                                // change the payment_status = 1
                                const orderId = parsedResult.xml.out_trade_no[0];
                                const orderResult = yield Order_1.default.findOne({
                                    where: { id: orderId },
                                });
                                orderResult.payment_status = '1';
                                yield orderResult.save();
                                // return success to WePay
                                const retVal = {
                                    return_code: 'SUCCESS',
                                    return_msg: 'OK',
                                };
                                const builder = new xml2js_1.default.Builder({
                                    rootName: 'xml',
                                    headless: true,
                                });
                                resolve(h.response(builder.buildObject(retVal)));
                            }
                        }
                    }));
                });
            }),
            validate: {
                payload: joi_1.default.object()
                    .required()
                    .description(`https://codebeautify.org/multiline-to-single-line, use pattern: {"xml": "xml content here"}`),
            },
            tags: ['api', GROUP_NAME],
            description: `send notification if WePay is successful`,
            notes: `send notification if WePay is successful`,
            auth: false,
        },
    },
];
exports.default = ordersRoutes;
