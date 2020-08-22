let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { ConfigParams, IdGenerator } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { LocksMemoryPersistence } from '../../src/persistence/LocksMemoryPersistence';
import { LocksController } from '../../src/logic/LocksController';

let LOCK1: string = "lock_1";
let LOCK2: string = "lock_2";
let LOCK3: string = "lock_3";

suite('LocksController', () => {
    let persistence: LocksMemoryPersistence;
    let controller: LocksController;
    let client_id: string;
    let admin_id: string;

    setup((done) => {
        client_id = IdGenerator.nextLong();
        admin_id = IdGenerator.nextLong();

        persistence = new LocksMemoryPersistence();
        persistence.configure(new ConfigParams());

        controller = new LocksController();
        controller.configure(ConfigParams.fromTuples(
            'options.release_own_locks_only', true,
            'options.release_admin_id', admin_id
        ));

        let references = References.fromTuples(
            new Descriptor('pip-services-locks', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-locks', 'controller', 'default', 'default', '1.0'), controller
        );

        controller.setReferences(references);

        persistence.open(null, done);
    });

    teardown((done) => {
        persistence.close(null, done);
    });

    test('TryAcquireLock', (done) => {
        async.series([
            // Try to acquire lock for the first time
            (callback) => {
                controller.tryAcquireLock(null, LOCK1, 3000, client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Try to acquire lock for the second time
            (callback) => {
                controller.tryAcquireLock(null, LOCK1, 3000, client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isFalse(result);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                controller.releaseLock(null, LOCK1, client_id, callback);
            },
            // Try to acquire lock for the third time
            (callback) => {
                controller.tryAcquireLock(null, LOCK1, 3000, client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                controller.releaseLock(null, LOCK1, client_id, callback);
            },
            // Try to acquire lock for the fourth time
            (callback) => {
                controller.tryAcquireLock(null, LOCK1, 4000, client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Try to release the lock with wrong client id
            (callback) => {
                controller.releaseLock(null, LOCK1, IdGenerator.nextLong(), (err) => {
                    assert.isNotNull(err || null); // should get an error
                    callback();
                });
            },
            // Try to acquire lock to check it still exist
            (callback) => {
                controller.tryAcquireLock(null, LOCK1, 4000, client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isFalse(result);
                    callback();
                });
            },
            // Release the lock with admin id
            (callback) => {
                controller.releaseLock(null, LOCK1, admin_id, (err) => {
                    assert.isNull(err || null); 
                    callback();
                });
            },
            // Try to acquire lock to check it not exist
            (callback) => {
                controller.tryAcquireLock(null, LOCK1, 4000, client_id, (err, result) => {
                    assert.isNull(err || null);
                    assert.isTrue(result);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                controller.releaseLock(null, LOCK1, client_id, callback);
            },
        ], done);
    });


    test('AcquireLock', (done) => {

        async.series([
            // Acquire lock for the first time
            (callback) => {
                controller.acquireLock(null, LOCK2, 3000, 1000, client_id, (err) => {
                    assert.isNull(err || null);
                    callback();
                });
            },
            // Acquire lock for the second time
            (callback) => {
                controller.acquireLock(null, LOCK2, 3000, 1000, client_id, (err) => {
                    assert.isNotNull(err || null);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                controller.releaseLock(null, LOCK2, client_id, callback)
            },
            // Acquire lock for the third time
            (callback) => {
                controller.acquireLock(null, LOCK2, 3000, 1000, client_id, (err) => {
                    assert.isNull(err || null);
                    callback();
                });
            },
            // Release the lock
            (callback) => {
                controller.releaseLock(null, LOCK2, client_id, callback)
            },
        ], done);
    });

});