import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { LockV1 } from '../data/version1/LockV1';
export interface ILocksPersistence {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<LockV1>) => void): void;
    getOneById(correlationId: string, key: string, callback: (err: any, lock: LockV1) => void): void;
    tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string, callback: (err: any, result: boolean) => void): void;
    releaseLock(correlationId: string, key: string, client_id: string, callback: (err: any) => void): void;
    deleteByFilter(correlationId: string, filter: FilterParams, callback: (err: any) => void): void;
}
