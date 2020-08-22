import { FilterParams } from "pip-services3-commons-node";
import { PagingParams } from "pip-services3-commons-node";
import { DataPage } from "pip-services3-commons-node";

import { LockV1 } from "../data/version1";

export interface ILocksController {
    // Get list of all locks
    getLocks(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<LockV1>) => void): void;
    
    // Get lock by key
    getLockById(correlationId: string, key: string, 
        callback: (err: any, job: LockV1) => void): void;
    
    // Makes a single attempt to acquire a lock by its key
    tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string, 
        callback: (err: any, result: boolean) => void): void;
    
    // Makes multiple attempts to acquire a lock by its key within give time interval
    acquireLock(correlationId: string, key: string, ttl: number, timeout: number, client_id: string,
        callback: (err: any) => void): void;
    
        // Releases prevously acquired lock by its key
    releaseLock(correlationId: string, key: string, client_id: string, 
        callback: (err: any) => void): void;
}