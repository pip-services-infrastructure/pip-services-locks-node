let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;
let restify = require('restify');

import { ConfigParams, DateTimeConverter, IdGenerator } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { LocksMemoryPersistence } from '../../../src/persistence/LocksMemoryPersistence';
import { LocksController } from '../../../src/logic/LocksController';
import { LocksHttpServiceV1 } from '../../../src/services/version1/LocksHttpServiceV1';


let LOCK1: string = "lock_1";
let LOCK2: string = "lock_2";
let LOCK3: string = "lock_3";

suite('LocksHttpServiceV1', () => {
    let persistence: LocksMemoryPersistence;
    let controller: LocksController;
    let service: LocksHttpServiceV1;
    let rest: any;
    let client_id: string;
    let admin_id: string;

    setup((done) => {
        client_id = IdGenerator.nextLong();
        admin_id = IdGenerator.nextLong();

        let url = "http://localhost:3000";
        rest = restify.createJsonClient({ url: url, version: '*' });

        persistence = new LocksMemoryPersistence();
        persistence.configure(new ConfigParams());

        controller = new LocksController();
        controller.configure(ConfigParams.fromTuples(
            'options.release_own_locks_only', true,
            'options.release_admin_id', admin_id
        ));

        service = new LocksHttpServiceV1();
        service.configure(ConfigParams.fromTuples(
            'connection.protocol', 'http',
            'connection.port', 3000,
            'connection.host', 'localhost'
        ));

        let references = References.fromTuples(
            new Descriptor('pip-services-locks', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-locks', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-locks', 'service', 'http', 'default', '1.0'), service
        );

        controller.setReferences(references);
        service.setReferences(references);

        persistence.open(null, (err) => {
            if (err) {
                done(err);
                return;
            }

            service.open(null, done);
        });
    });

    teardown((done) => {
        service.close(null, (err) => {
            persistence.close(null, done);
        });
    });

    test('TryAcquireLock', (done) => {
        async.series([
            // Try to acquire lock for the first time
            (callback) => {
                rest.post('/v1/locks/try_acquire_lock',
                    {
                        key: LOCK1,
                        ttl: 3000,
                        client_id: client_id
                    }, (err, req, res, result) => {
                        assert.isNull(err || null);
                        assert.equal(result, 'true');
                        callback();
                    }
                );
            },
            // Try to acquire lock for the second time
            (callback) => {
                rest.post('/v1/locks/try_acquire_lock',
                    {
                        key: LOCK1,
                        ttl: 3000,
                        client_id: client_id
                    }, (err, req, res, result) => {
                        assert.isNull(err || null);
                        assert.equal(result, 'false');
                        callback();
                    }
                );
            },
            // Release the lock
            (callback) => {
                rest.post('/v1/locks/release_lock',
                    {
                        key: LOCK1,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNull(err || null);
                        callback();
                    });
            },
            // Try to acquire lock for the third time
            (callback) => {
                rest.post('/v1/locks/try_acquire_lock',
                    {
                        key: LOCK1,
                        ttl: 3000,
                        client_id: client_id
                    }, (err, req, res, result) => {
                        assert.isNull(err || null);
                        assert.equal(result, 'true');
                        callback();
                    });
            },
            // Release the lock
            (callback) => {
                rest.post('/v1/locks/release_lock',
                    {
                        key: LOCK1,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNull(err || null);
                        callback();
                    });
            },
        ], done);
    });

    test('AcquireLock', (done) => {

        async.series([
            // Acquire lock for the first time
            (callback) => {
                rest.post('/v1/locks/acquire_lock',
                    {
                        key: LOCK2,
                        ttl: 3000,
                        timeout: 1000,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNull(err || null);
                        callback();
                    });
            },
            // Acquire lock for the second time
            (callback) => {
                rest.post('/v1/locks/acquire_lock',
                    {
                        key: LOCK2,
                        ttl: 3000,
                        timeout: 1000,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNotNull(err || null);
                        callback();
                    });
            },
            // Release the lock
            (callback) => {
                rest.post('/v1/locks/release_lock',
                    {
                        key: LOCK2,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNull(err || null);
                        callback();
                    });
            },
            // Acquire lock for the third time
            (callback) => {
                rest.post('/v1/locks/acquire_lock',
                    {
                        key: LOCK2,
                        ttl: 3000,
                        timeout: 1000,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNull(err || null);
                        callback();
                    });
            },
            // Release the lock
            (callback) => {
                rest.post('/v1/locks/release_lock',
                    {
                        key: LOCK2,
                        client_id: client_id
                    }, (err, req, res) => {
                        assert.isNull(err || null);
                        callback();
                    });
            }
        ], done);
    });
});