import { JsonFilePersister } from 'pip-services3-data-node';
import { LockV1 } from '../data/version1/LockV1';
import { LocksMemoryPersistence } from './LocksMemoryPersistence';
import { ConfigParams } from 'pip-services3-commons-node';
export declare class LocksFilePersistence extends LocksMemoryPersistence {
    protected _persister: JsonFilePersister<LockV1>;
    constructor(path?: string);
    configure(config: ConfigParams): void;
}
