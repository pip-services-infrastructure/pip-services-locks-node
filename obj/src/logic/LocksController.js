"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const LocksCommandSet_1 = require("./LocksCommandSet");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_components_node_1 = require("pip-services3-components-node");
class LocksController {
    constructor() {
        this._opened = false;
        this._logger = new pip_services3_components_node_1.CompositeLogger();
        this._timer = new pip_services3_commons_node_3.FixedRateTimer();
        this._cleanInterval = 1000 * 60 * 5;
        this._retryTimeout = 100;
        this._releaseOwnLocksOnly = true;
    }
    configure(config) {
        this._config = config;
        this._logger.configure(config);
        this._cleanInterval = config.getAsLongWithDefault('options.clean_interval', 1000 * 60);
        this._releaseOwnLocksOnly = config.getAsBooleanWithDefault('options.release_own_locks_only', true);
        this._release_admin_id = config.getAsStringWithDefault('options.release_admin_id', pip_services3_commons_node_1.IdGenerator.nextLong());
    }
    open(correlationId, callback) {
        this._timer.setCallback(() => {
            this.cleanLocks(correlationId);
        });
        if (this._cleanInterval > 0) {
            this._timer.setInterval(this._cleanInterval);
            this._timer.start();
        }
        this._opened = true;
        this._logger.trace(correlationId, "Locks controller is opened");
        if (callback)
            callback(null);
    }
    isOpen() {
        return this._opened;
    }
    close(correlationId, callback) {
        if (this._timer.isStarted) {
            this._timer.stop();
        }
        this._opened = false;
        this._logger.trace(correlationId, "Locks controller is closed");
        if (callback)
            callback(null);
    }
    setReferences(references) {
        this._persistence = references.getOneRequired(new pip_services3_commons_node_2.Descriptor('pip-services-locks', 'persistence', '*', '*', '1.0'));
        this._logger.setReferences(references);
    }
    getCommandSet() {
        if (this._commandSet == null) {
            this._commandSet = new LocksCommandSet_1.LocksCommandSet(this);
        }
        return this._commandSet;
    }
    getLocks(correlationId, filter, paging, callback) {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }
    getLockById(correlationId, key, callback) {
        this._persistence.getOneById(correlationId, key, callback);
    }
    tryAcquireLock(correlationId, key, ttl, client_id, callback) {
        this._persistence.tryAcquireLock(correlationId, key, ttl, client_id, callback);
    }
    acquireLock(correlationId, key, ttl, timeout, client_id, callback) {
        let retryTime = new Date().getTime() + timeout;
        // Try to get lock first
        this.tryAcquireLock(correlationId, key, ttl, client_id, (err, result) => {
            if (err || result) {
                callback(err);
                return;
            }
            // Start retrying
            let interval = setInterval(() => {
                // When timeout expires return false
                let now = new Date().getTime();
                if (now > retryTime) {
                    clearInterval(interval);
                    let err = new pip_services3_commons_node_1.ConflictException(correlationId, "LOCK_TIMEOUT", "Acquiring lock " + key + " failed on timeout").withDetails("key", key);
                    callback(err);
                    return;
                }
                this._persistence.tryAcquireLock(correlationId, key, ttl, client_id, (err, result) => {
                    if (err || result) {
                        clearInterval(interval);
                        callback(err);
                    }
                });
            }, this._retryTimeout);
        });
    }
    releaseLock(correlationId, key, client_id, callback) {
        let clientId = client_id || '';
        if (!this._releaseOwnLocksOnly || client_id == this._release_admin_id) {
            clientId = null;
        }
        this._persistence.releaseLock(correlationId, key, clientId, callback);
    }
    // Clean expired locks
    cleanLocks(correlationId, callback) {
        let now = new Date();
        this._logger.trace(correlationId, "Starting locks cleaning...");
        async.series([
            (callback) => {
                this._persistence.deleteByFilter(correlationId, pip_services3_commons_node_1.FilterParams.fromTuples('to_expired', now), callback);
            },
        ], (err) => {
            if (err != null) {
                this._logger.error(correlationId, err, "Failed to clean up locks.");
            }
            this._logger.trace(correlationId, "Locks cleaning ended.");
            callback(err);
        });
    }
}
exports.LocksController = LocksController;
//# sourceMappingURL=LocksController.js.map