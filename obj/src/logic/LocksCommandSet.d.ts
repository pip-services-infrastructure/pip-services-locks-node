import { CommandSet } from 'pip-services3-commons-node';
import { ILocksController } from './ILocksController';
export declare class LocksCommandSet extends CommandSet {
    private _controller;
    private _default_ttl;
    private _default_timeout;
    constructor(controller: ILocksController);
    private makeGetLocks;
    private makeGetLockById;
    private makeTryAcquireLock;
    private makeAcquireLock;
    private makeReleaseLock;
}
