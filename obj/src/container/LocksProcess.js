"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const LocksServiceFactory_1 = require("../build/LocksServiceFactory");
class LocksProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super('jobs', 'Locks orchestration microservice');
        this._factories.add(new LocksServiceFactory_1.LocksServiceFactory());
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory());
    }
}
exports.LocksProcess = LocksProcess;
//# sourceMappingURL=LocksProcess.js.map