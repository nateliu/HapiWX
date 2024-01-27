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
const hapi_1 = __importDefault(require("@hapi/hapi"));
const hapi_auth_jwt2_1 = __importDefault(require("hapi-auth-jwt2"));
const hello_world_1 = __importDefault(require("./routes/hello-world"));
const config_1 = __importDefault(require("./config/config"));
const hapi_swagger_1 = __importDefault(require("./plugins/hapi-swagger"));
const hapi_pagination_1 = __importDefault(require("./plugins/hapi-pagination"));
const shops_1 = __importDefault(require("./routes/shops"));
const orders_1 = __importDefault(require("./routes/orders"));
const users_1 = __importDefault(require("./routes/users"));
const hapi_auth_jwt2_2 = __importDefault(require("./plugins/hapi-auth-jwt2"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    const server = hapi_1.default.server({
        port: config_1.default.server.port,
        host: config_1.default.server.host,
    });
    yield server.register([...hapi_swagger_1.default, ...hapi_pagination_1.default]);
    yield server.register(hapi_auth_jwt2_1.default);
    (0, hapi_auth_jwt2_2.default)(server);
    server.route([...hello_world_1.default, ...shops_1.default, ...orders_1.default, ...users_1.default]);
    yield server.start();
    console.log('Server running on %s', server.info.uri);
});
process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});
init();
