import { FilterParams } from "pip-services3-commons-node";
import { PagingParams } from "pip-services3-commons-node";
import { DataPage } from "pip-services3-commons-node";
import { LockV1 } from "../data/version1";
export interface ILocksController {
    getLocks(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<LockV1>) => void): void;
    getLockById(correlationId: string, key: string, callback: (err: any, job: LockV1) => void): void;
    tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string, callback: (err: any, result: boolean) => void): void;
    acquireLock(correlationId: string, key: string, ttl: number, timeout: number, client_id: string, callback: (err: any) => void): void;
    releaseLock(correlationId: string, key: string, client_id: string, callback: (err: any) => void): void;
}
