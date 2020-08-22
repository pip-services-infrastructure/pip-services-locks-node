import { ConfigParams } from 'pip-services3-commons-node';

import { LocksFilePersistence } from '../../src/persistence/LocksFilePersistence';
import { LocksPersistenceFixture } from './LocksPersistenceFixture';

suite('LocksFilePersistence', () => {
    let persistence: LocksFilePersistence;
    let fixture: LocksPersistenceFixture;

    setup((done) => {
        persistence = new LocksFilePersistence('data/locks.test.json');
        persistence.configure(new ConfigParams());

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