"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_data_node_1 = require("pip-services3-data-node");
class LocksMemoryPersistence extends pip_services3_data_node_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
        this._maxPageSize = 1000;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
        let key = filter.getAsNullableString('key');
        var fromCreated = filter.getAsNullableDateTime('from_created');
        var toCreated = filter.getAsNullableDateTime('to_created');
        var fromExpired = filter.getAsNullableDateTime('from_expired');
        var toExpired = filter.getAsNullableDateTime('to_expired');
        return (item) => {
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
        };
    }
    tryAcquireLock(correlationId, key, ttl, client_id, callback) {
        let item = _.find(this._items, (item) => item.id == key);
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
        });
    }
    releaseLock(correlationId, key, client_id, callback) {
        var index = this._items.map(x => x.id).indexOf(key);
        var item = index < 0 ? null : this._items[index];
        if (item == null || (client_id != null && item.client_id != client_id)) {
            let err = new pip_services3_commons_node_1.NotFoundException(correlationId, 'LOCK_NOT_FOUND', 'Lock with key ' + key + ' not found!');
            if (callback)
                callback(err);
            return;
        }
        this._items.splice(index, 1);
        if (callback)
            callback(null);
    }
    getPageByFilter(correlationId, filter, paging, callback) {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, callback);
    }
    deleteByFilter(correlationId, filter, callback) {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }
    matchString(value, search) {
        if (value == null && search == null)
            return true;
        if (value == null || search == null)
            return false;
        return value.toLowerCase().indexOf(search) >= 0;
    }
}
exports.LocksMemoryPersistence = LocksMemoryPersistence;
//# sourceMappingURL=LocksMemoryPersistence.js.map