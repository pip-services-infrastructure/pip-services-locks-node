import { ConfigParams } from 'pip-services3-commons-node';

import { LocksMemoryPersistence } from '../../src/persistence/LocksMemoryPersistence';
import { LocksPersistenceFixture } from './LocksPersistenceFixture';

suite('LocksMemoryPersistence', () => {
    let persistence: LocksMemoryPersistence;
    let fixture: LocksPersistenceFixture;

    setup((done) => {
        persistence = new LocksMemoryPersistence();
        persistence.configure(new ConfigParams());

        fixture = new LocksPersistenceFixture(persistence);

        persistence.open(null, done);
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