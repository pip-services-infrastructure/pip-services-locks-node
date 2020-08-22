"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_mongodb_node_1 = require("pip-services3-mongodb-node");
class LocksMongoDbPersistence extends pip_services3_mongodb_node_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('locks');
        this._retryTimeout = 100;
        this._maxPageSize = 1000;
        this.ensureIndex({
            client_id: 1
        });
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
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
    tryAcquireLock(correlationId, key, ttl, client_id, callback) {
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
            if (callback)
                callback(err, item == null);
        });
    }
    releaseLock(correlationId, key, client_id, callback) {
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
                    err = new pip_services3_commons_node_1.NotFoundException(correlationId, 'LOCK_NOT_FOUND', 'Lock with key ' + key + ' not found!');
                }
                callback(err);
            }
        });
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }
    deleteByFilter(correlationId, filter, callback) {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }
}
exports.LocksMongoDbPersistence = LocksMongoDbPersistence;
//# sourceMappingURL=LocksMongoDbPersistence.js.map