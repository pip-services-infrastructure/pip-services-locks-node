let _ = require('lodash');
let async = require('async');

import { FilterParams, IOpenable, AnyValueMap, ConflictException, IdGenerator } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';

import { LockV1 } from '../data/version1/LockV1';
import { ILocksPersistence } from '../persistence/ILocksPersistence';
import { ILocksController } from './ILocksController';
import { LocksCommandSet } from './LocksCommandSet';
import { FixedRateTimer } from 'pip-services3-commons-node';
import { CompositeLogger } from 'pip-services3-components-node';

export class LocksController implements ILocksController, IConfigurable, IReferenceable, ICommandable, IOpenable {
    private _persistence: ILocksPersistence;
    private _commandSet: LocksCommandSet;
    private _opened: boolean = false;
    private _config: ConfigParams;
    private _logger: CompositeLogger = new CompositeLogger();

    private _timer: FixedRateTimer = new FixedRateTimer();
    private _cleanInterval: number = 1000 * 60 * 5;

    private _retryTimeout: number = 100;
    private _releaseOwnLocksOnly: boolean = true;
    private _release_admin_id: string;

    public constructor() {
    }

    public configure(config: ConfigParams): void {
        this._config = config;
        this._logger.configure(config);

        this._cleanInterval = config.getAsLongWithDefault('options.clean_interval', 1000 * 60);
        this._releaseOwnLocksOnly = config.getAsBooleanWithDefault('options.release_own_locks_only', true);
        this._release_admin_id = config.getAsStringWithDefault('options.release_admin_id', IdGenerator.nextLong());
    }

    public open(correlationId: string, callback?: (err: any) => void): void {
        this._timer.setCallback(() => {
            this.cleanLocks(correlationId);
        });
        if (this._cleanInterval > 0) {
            this._timer.setInterval(this._cleanInterval);
            this._timer.start();
        }

        this._opened = true;
        this._logger.trace(correlationId, "Locks controller is opened");
        if (callback)
            callback(null);
    }

    public isOpen(): boolean {
        return this._opened;
    }

    public close(correlationId: string, callback?: (err: any) => void): void {
        if (this._timer.isStarted) {
            this._timer.stop();
        }

        this._opened = false;
        this._logger.trace(correlationId, "Locks controller is closed");
        if (callback)
            callback(null);
    }

    public setReferences(references: IReferences): void {
        this._persistence = references.getOneRequired<ILocksPersistence>(
            new Descriptor('pip-services-locks', 'persistence', '*', '*', '1.0')
        );
        this._logger.setReferences(references);
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null) {
            this._commandSet = new LocksCommandSet(this);
        }
        return this._commandSet;
    }

    public getLocks(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<LockV1>) => void): void {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }

    public getLockById(correlationId: string, key: string,
        callback: (err: any, lock: LockV1) => void): void {
        this._persistence.getOneById(correlationId, key, callback);
    }

    public tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string,
        callback: (err: any, result: boolean) => void): void {
        this._persistence.tryAcquireLock(correlationId, key, ttl, client_id, callback);
    }

    public acquireLock(correlationId: string, key: string, ttl: number, timeout: number, client_id: string,
        callback: (err: any) => void): void {
        let retryTime = new Date().getTime() + timeout;

        // Try to get lock first
        this.tryAcquireLock(correlationId, key, ttl, client_id, (err, result) => {
            if (err || result) {
                callback(err);
                return;
            }

            // Start retrying
            let interval = setInterval(() => {
                // When timeout expires return false
                let now = new Date().getTime();
                if (now > retryTime) {
                    clearInterval(interval);
                    let err = new ConflictException(
                        correlationId,
                        "LOCK_TIMEOUT",
                        "Acquiring lock " + key + " failed on timeout"
                    ).withDetails("key", key);
                    callback(err);
                    return;
                }

                this._persistence.tryAcquireLock(correlationId, key, ttl, client_id, (err, result) => {
                    if (err || result) {
                        clearInterval(interval);
                        callback(err);
                    }
                });
            }, this._retryTimeout);
        });
    }

    public releaseLock(correlationId: string, key: string, client_id: string, callback: (err: any) => void): void {
        let clientId: string = client_id || '';

        if (!this._releaseOwnLocksOnly || client_id == this._release_admin_id) {
            clientId = null;
        }

        this._persistence.releaseLock(correlationId, key, clientId, callback);
    }

    // Clean expired locks
    public cleanLocks(correlationId: string, callback?: (err: any) => void): void {
        let now = new Date();

        this._logger.trace(correlationId, "Starting locks cleaning...");

        async.series([
            (callback) => {
                this._persistence.deleteByFilter(
                    correlationId,
                    FilterParams.fromTuples(
                        'to_expired', now
                    ),
                    callback
                );
            },
        ], (err) => {
            if (err != null) {
                this._logger.error(correlationId, err, "Failed to clean up locks.");
            }

            this._logger.trace(correlationId, "Locks cleaning ended.");

            callback(err);
        });
    }

}
