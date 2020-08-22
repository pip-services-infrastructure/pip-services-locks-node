import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';
import { LockV1 } from '../data/version1/LockV1';
import { ILocksPersistence } from './ILocksPersistence';
export declare class LocksMongoDbPersistence extends IdentifiableMongoDbPersistence<LockV1, string> implements ILocksPersistence {
    private _retryTimeout;
    constructor();
    private composeFilter;
    tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string, callback: (err: any, result: boolean) => void): void;
    releaseLock(correlationId: string, key: string, client_id: string, callback: (err: any) => void): void;
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<LockV1>) => void): void;
    deleteByFilter(correlationId: string, filter: FilterParams, callback: (err: any) => void): void;
}
