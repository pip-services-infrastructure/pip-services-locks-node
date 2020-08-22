let _ = require('lodash');

import { FilterParams, ConflictException, NotFoundException } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';

import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';

import { LockV1 } from '../data/version1/LockV1';
import { ILocksPersistence } from './ILocksPersistence';

export class LocksMongoDbPersistence
    extends IdentifiableMongoDbPersistence<LockV1, string>
    implements ILocksPersistence {

    private _retryTimeout: number = 100;

    constructor() {
        super('locks');
        this._maxPageSize = 1000;
        this.ensureIndex({
            client_id: 1
        });
    }

    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();

        let criteria = [];

        let key = filter.getAsNullableString('key');
        if (key != null) {
            let regex = new RegExp(key, "i");
            criteria.push({ _id: { $regex: regex } });
        }

        var fromCreated = filter.getAsNullableDateTime('from_created');
        if (fromCreated != null) {
            criteria.push({
                created: { $gte: fromCreated }
            });
        }

        var toCreated = filter.getAsNullableDateTime('to_created');
        if (toCreated != null) {
            criteria.push({
                created: { $lt: toCreated }
            });
        }

        var fromExpired = filter.getAsNullableDateTime('from_expired');
        if (fromExpired != null) {
            criteria.push({
                expire_time: { $gte: fromExpired }
            });
        }

        var toExpired = filter.getAsNullableDateTime('to_expired');
        if (toExpired != null) {
            criteria.push({
                expire_time: { $lt: toExpired }
            });
        }

        return criteria.length > 0 ? { $and: criteria } : null;
    }

    public tryAcquireLock(correlationId: string, key: string, ttl: number, client_id: string,
        callback: (err: any, result: boolean) => void): void {

        let now = Date.now();

        let criteria = {
            _id: key
        };

        let update = {
            $setOnInsert: {
                id: key,
                created: new Date(now),
                expire_time: new Date(now + ttl),
                client_id: client_id
            }
        };

        let options = {
            upsert: true
        };

        this._collection.findOneAndUpdate(criteria, update, options, (err, result) => {
            let item = result ? this.convertToPublic(result.value) : null;

            if (callback) callback(err, item == null);
        });
    }

    public releaseLock(correlationId: string, key: string, client_id: string,
        callback: (err: any) => void): void {

        let filter = {
            _id: key
        };

        if (client_id) {
            filter['client_id'] = client_id;
        }

        this._collection.findOneAndDelete(filter, (err, result) => {
            if (callback) {
                let oldItem = result ? this.convertToPublic(result.value) : null;

                if (!err && !oldItem) {
                    err = new NotFoundException(
                        correlationId,
                        'LOCK_NOT_FOUND',
                        'Lock with key ' + key + ' not found!'
                    );
                }

                callback(err);
            }
        });
    }

    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<LockV1>) => void): void {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }

    public deleteByFilter(correlationId: string, filter: FilterParams, callback: (err: any) => void): void {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }
}