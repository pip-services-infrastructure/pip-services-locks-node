"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const pip_services3_commons_node_6 = require("pip-services3-commons-node");
const pip_services3_commons_node_7 = require("pip-services3-commons-node");
const pip_services3_commons_node_8 = require("pip-services3-commons-node");
class LocksCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(controller) {
        super();
        this._default_ttl = 10 * 1000;
        this._default_timeout = 60 * 1000;
        this._controller = controller;
        this.addCommand(this.makeGetLocks());
        this.addCommand(this.makeGetLockById());
        this.addCommand(this.makeTryAcquireLock());
        this.addCommand(this.makeAcquireLock());
        this.addCommand(this.makeReleaseLock());
    }
    makeGetLocks() {
        return new pip_services3_commons_node_4.Command('get_locks', new pip_services3_commons_node_5.ObjectSchema(false)
            .withOptionalProperty('filter', new pip_services3_commons_node_6.FilterParamsSchema())
            .withOptionalProperty('paging', new pip_services3_commons_node_7.PagingParamsSchema()), (correlationId, args, callback) => {
            let filter = pip_services3_commons_node_2.FilterParams.fromValue(args.get('filter'));
            let paging = pip_services3_commons_node_3.PagingParams.fromValue(args.get('paging'));
            this._controller.getLocks(correlationId, filter, paging, callback);
        });
    }
    makeGetLockById() {
        return new pip_services3_commons_node_4.Command('get_lock_by_id', new pip_services3_commons_node_5.ObjectSchema(false)
            .withRequiredProperty('key', pip_services3_commons_node_8.TypeCode.String), (correlationId, args, callback) => {
            let lockId = args.getAsString('key');
            this._controller.getLockById(correlationId, lockId, callback);
        });
    }
    makeTryAcquireLock() {
        return new pip_services3_commons_node_4.Command('try_acquire_lock', new pip_services3_commons_node_5.ObjectSchema(false)
            .withRequiredProperty('key', pip_services3_commons_node_8.TypeCode.String)
            .withRequiredProperty('ttl', pip_services3_commons_node_8.TypeCode.Integer)
            .withRequiredProperty('client_id', pip_services3_commons_node_8.TypeCode.String), (correlationId, args, callback) => {
            let key = args.getAsString('key');
            let ttl = args.getAsIntegerWithDefault('ttl', this._default_ttl);
            let client_id = args.getAsString('client_id');
            this._controller.tryAcquireLock(correlationId, key, ttl, client_id, (err, result) => {
                callback(err, result.toString());
            });
        });
    }
    makeAcquireLock() {
        return new pip_services3_commons_node_4.Command('acquire_lock', new pip_services3_commons_node_5.ObjectSchema(false)
            .withRequiredProperty('key', pip_services3_commons_node_8.TypeCode.String)
            .withRequiredProperty('ttl', pip_services3_commons_node_8.TypeCode.Integer)
            .withRequiredProperty('timeout', pip_services3_commons_node_8.TypeCode.Integer)
            .withRequiredProperty('client_id', pip_services3_commons_node_8.TypeCode.String), (correlationId, args, callback) => {
            let key = args.getAsString('key');
            let ttl = args.getAsIntegerWithDefault('ttl', this._default_ttl);
            let timeout = args.getAsIntegerWithDefault('timeout', this._default_timeout);
            let client_id = args.getAsString('client_id');
            this._controller.acquireLock(correlationId, key, ttl, timeout, client_id, callback);
        });
    }
    makeReleaseLock() {
        return new pip_services3_commons_node_4.Command('release_lock', new pip_services3_commons_node_5.ObjectSchema(false)
            .withRequiredProperty('key', pip_services3_commons_node_8.TypeCode.String)
            .withRequiredProperty('client_id', pip_services3_commons_node_8.TypeCode.String), (correlationId, args, callback) => {
            let key = args.getAsString('key');
            let client_id = args.getAsString('client_id');
            this._controller.releaseLock(correlationId, key, client_id, callback);
        });
    }
}
exports.LocksCommandSet = LocksCommandSet;
//# sourceMappingURL=LocksCommandSet.js.map