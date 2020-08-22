import { JsonFilePersister } from 'pip-services3-data-node';

import { LockV1 } from '../data/version1/LockV1';
import { LocksMemoryPersistence } from './LocksMemoryPersistence';
import { ConfigParams } from 'pip-services3-commons-node';

export class LocksFilePersistence extends LocksMemoryPersistence {
    protected _persister: JsonFilePersister<LockV1>;

    constructor(path?: string) {
        super();

        this._persister = new JsonFilePersister<LockV1>(path);
        this._loader = this._persister;
        this._saver = this._persister;
    }

    public configure(config: ConfigParams) {
        super.configure(config);
        this._persister.configure(config);
    }

}