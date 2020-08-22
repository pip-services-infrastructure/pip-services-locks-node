import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { LocksMemoryPersistence } from '../persistence/LocksMemoryPersistence';
import { LocksFilePersistence } from '../persistence/LocksFilePersistence';
import { LocksMongoDbPersistence } from '../persistence/LocksMongoDbPersistence';
import { LocksController } from '../logic/LocksController';
import { LocksHttpServiceV1 } from '../services/version1/LocksHttpServiceV1';

export class LocksServiceFactory extends Factory{
    public static MemoryPersistenceDescriptor = new Descriptor('pip-services-locks', 'persistence', 'memory', '*', '1.0');
    public static FilePersistenceDescriptor = new Descriptor('pip-services-locks', 'persistence', 'file', '*', '1.0');
    public static MongoDbPersistenceDescriptor = new Descriptor('pip-services-locks', 'persistence', 'mongodb', '*', '1.0');
    public static ControllerDescriptor = new Descriptor('pip-services-locks', 'controller', 'default', '*', '1.0');
    public static HttpServiceV1Descriptor = new Descriptor('pip-services-locks', 'service', 'http', '*', '1.0');
    
    constructor(){
        super();

        this.registerAsType(LocksServiceFactory.MemoryPersistenceDescriptor, LocksMemoryPersistence);
        this.registerAsType(LocksServiceFactory.FilePersistenceDescriptor, LocksFilePersistence);
        this.registerAsType(LocksServiceFactory.MongoDbPersistenceDescriptor, LocksMongoDbPersistence);
        this.registerAsType(LocksServiceFactory.ControllerDescriptor, LocksController);
        this.registerAsType(LocksServiceFactory.HttpServiceV1Descriptor, LocksHttpServiceV1);
    }
}