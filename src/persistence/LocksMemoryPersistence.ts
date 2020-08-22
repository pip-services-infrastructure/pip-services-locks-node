let _ = require('lodash');

import { FilterParams, ConflictException, NotFoundException } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';

import { LockV1 } from '../data/version1/LockV1';
import { ILocksPersistence } from './ILocksPersistence';

export class LocksMemoryPersistence
    extends IdentifiableMemoryPersistence<LockV1, string>
    implements ILocksPersistence {

    constructor() {
        super();

        this._maxPageSize = 1000;
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();

        let key = filter.getAsNullableString('key');
        var fromCreated = filter.getAsNullableDateTime('from_created');
        var toCreated = filter.getAsNullableDateTime('to_created');
        var fromExpired = filter.getAsNullableDateTime('from_expired');
        var toExpired = filter.getAsNullableDateTime('to_expired');

        return (item: LockV1) => {
            if (key != null && !this.matchString(item.id, key))
                return false;
            if (fromCreated != null && item.created.getTime() < fromCreated.getTime())
                return false;
            if (toCreated != null && item.created.getTime() > toCreated.getTime())
                return false;
            if (fromExpired != null && item.expire_time.getTime() < fromExpired.getTime())
                return false;
            if (toExpired != null && item.expire_time.getTime() > toExpired.getTime())
                return false;
            return true;
        }
    }

    public tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string,
        callback: (err: any, result: boolean) => void): void {
        let item: LockV1 = _.find(this._items, (item: LockV1) => item.id == key);
        let now = new Date().getTime();

        if (item == null) {
            item = {
                id: key,
                created: new Date(now),
                expire_time: new Date(0),
                client_id: client_id
            };

            this._items.push(item);
        }

        let result = false;

        if (item.expire_time.getTime() < now) {
            item.expire_time = new Date(now + ttl);

            result = true;
        }

        this.save(correlationId, (err) => {
            callback(err, result);
        })
    }

    public releaseLock(correlationId: string, key: string, client_id: string,
        callback: (err: any) => void): void {
        var index = this._items.map(x => x.id).indexOf(key);
        var item = index < 0 ? null : this._items[index];

        if (item == null || (client_id != null && item.client_id != client_id)) {
            let err = new NotFoundException(
                correlationId,
                'LOCK_NOT_FOUND',
                'Lock with key ' + key + ' not found!'
            )

            if (callback) callback(err);
            return;
        }

        this._items.splice(index, 1);

        if (callback) callback(null);
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<LockV1>) => void): void {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }

    public deleteByFilter(correlationId: string, filter: FilterParams, callback: (err: any) => void): void {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }

    private matchString(value: string, search: string): boolean {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }
}