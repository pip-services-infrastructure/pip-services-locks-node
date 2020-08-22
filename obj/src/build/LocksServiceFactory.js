"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const LocksMemoryPersistence_1 = require("../persistence/LocksMemoryPersistence");
const LocksFilePersistence_1 = require("../persistence/LocksFilePersistence");
const LocksMongoDbPersistence_1 = require("../persistence/LocksMongoDbPersistence");
const LocksController_1 = require("../logic/LocksController");
const LocksHttpServiceV1_1 = require("../services/version1/LocksHttpServiceV1");
class LocksServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(LocksServiceFactory.MemoryPersistenceDescriptor, LocksMemoryPersistence_1.LocksMemoryPersistence);
        this.registerAsType(LocksServiceFactory.FilePersistenceDescriptor, LocksFilePersistence_1.LocksFilePersistence);
        this.registerAsType(LocksServiceFactory.MongoDbPersistenceDescriptor, LocksMongoDbPersistence_1.LocksMongoDbPersistence);
        this.registerAsType(LocksServiceFactory.ControllerDescriptor, LocksController_1.LocksController);
        this.registerAsType(LocksServiceFactory.HttpServiceV1Descriptor, LocksHttpServiceV1_1.LocksHttpServiceV1);
    }
}
exports.LocksServiceFactory = LocksServiceFactory;
LocksServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-locks', 'persistence', 'memory', '*', '1.0');
LocksServiceFactory.FilePersistenceDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-locks', 'persistence', 'file', '*', '1.0');
LocksServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-locks', 'persistence', 'mongodb', '*', '1.0');
LocksServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor('pip-services-locks', 'controller', 'default', '*', '1.0');
LocksServiceFactory.HttpServiceV1Descriptor = new pip_services3_commons_node_1.Descriptor('pip-services-locks', 'service', 'http', '*', '1.0');
//# sourceMappingURL=LocksServiceFactory.js.map