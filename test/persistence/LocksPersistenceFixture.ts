let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { FilterParams, IdGenerator } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { ILocksPersistence } from '../../src/persistence/ILocksPersistence';

let now = new Date();

let LOCK1: string = "lock_1";
let LOCK2: string = "lock_2";
let LOCK3: string = "lock_3";

export class LocksPersistenceFixture {
    private _persistence: ILocksPersistence;
    private _client_id: string;
    private _admin_id: string;

    public constructor(persistence: ILocksPersistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;

        this._client_id = IdGenerator.nextLong();
        this._admin_id = IdGenerator.nextLong();
    }

    public testTryAcquireLock(done: (err: any) => void): void {
        async.series([
            // Try to acquire lock for the first time
            (callback) => {
                this._persistence.tryAcquireLock(null, LOCK1, 3000, this._client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Try to acquire lock for the second time
            (callback) => {
                this._persistence.tryAcquireLock(null, LOCK1, 3000, this._client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isFalse(result);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                this._persistence.releaseLock(null, LOCK1, this._client_id, (err) => {
                    assert.isNull(err || null);
                    callback();
                });
            },
            // Try to acquire lock for the third time
            (callback) => {
                this._persistence.tryAcquireLock(null, LOCK1, 3000, this._client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                this._persistence.releaseLock(null, LOCK1, this._client_id, (err) => {
                    assert.isNull(err || null);
                    callback();
                });
            },
        ], done);
    }

    public testGetWithFilters(done: (err: any) => void): void {
        let now = Date.now();

        async.series([
            // Try to acquire first lock
            (callback) => {
                this._persistence.tryAcquireLock(null, LOCK1, 3000, this._client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Try to acquire second lock
            (callback) => {
                this._persistence.tryAcquireLock(null, LOCK2, 20000, this._client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            //  Get all locks
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromTuples(
                        'key', 'lock_'
                    ),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 2);

                        callback();
                    }
                )
            },
            //  Get locks by expired
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromTuples(
                        'from_expired', new Date(now + 5000),
                        'to_expired', new Date(now + 21000), 
                    ),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                )
            },
            // Release the first lock
            (callback) => {
                this._persistence.releaseLock(null, LOCK1, this._client_id, (err) => {
                    assert.isNull(err || null);
                    callback();
                });
            },
            // Release the second lock
            (callback) => {
                this._persistence.releaseLock(null, LOCK2, this._client_id, (err) => {
                    assert.isNull(err || null);
                    callback();
                });
            },
        ], done);
    }
}
