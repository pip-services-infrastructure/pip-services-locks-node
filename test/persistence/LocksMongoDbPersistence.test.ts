let process = require('process');

import { ConfigParams } from 'pip-services3-commons-node';

import { LocksMongoDbPersistence } from '../../src/persistence/LocksMongoDbPersistence';
import { LocksPersistenceFixture } from './LocksPersistenceFixture';

suite('LocksMongoDbPersistence', () => {
    let persistence: LocksMongoDbPersistence;
    let fixture: LocksPersistenceFixture;

    let mongoUri = process.env['MONGO_SERVICE_URI'];
    let mongoHost = process.env['MONGO_SERVICE_HOST'] || 'localhost';
    let mongoPort = process.env['MONGO_SERVICE_PORT'] || 27017;
    let mongoDatabase = process.env['MONGO_SERVICE_DB'] || 'test';

    // Exit if mongo connection is not set
    if (mongoUri == '' && mongoHost == '')
        return;

    setup((done) => {
        persistence = new LocksMongoDbPersistence();
        persistence.configure(ConfigParams.fromTuples(
            'connection.uri', mongoUri,
            'connection.host', mongoHost,
            'connection.port', mongoPort,
            'connection.database', mongoDatabase
        ));

        fixture = new LocksPersistenceFixture(persistence);

        persistence.open(null, (err) => {
            persistence.clear(null, done);
        });
    });

    teardown((done) => {
        persistence.close(null, done);
    });

    test('TryAcquireLock', (done) => {
        fixture.testTryAcquireLock(done);
    });

    test('GetWithFilters', (done) => {
        fixture.testGetWithFilters(done);
    });
});
