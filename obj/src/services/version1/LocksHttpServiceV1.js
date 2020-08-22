"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
class LocksHttpServiceV1 extends pip_services3_rpc_node_1.CommandableHttpService {
    constructor() {
        super('v1/locks');
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-locks', 'controller', '*', '*', '1.0'));
    }
}
exports.LocksHttpServiceV1 = LocksHttpServiceV1;
//# sourceMappingURL=LocksHttpServiceV1.js.map