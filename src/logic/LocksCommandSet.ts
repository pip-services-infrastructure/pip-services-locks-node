let _ = require('lodash');

import { CommandSet } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { FilterParamsSchema } from 'pip-services3-commons-node';
import { PagingParamsSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';

import { ILocksController } from './ILocksController';

export class LocksCommandSet extends CommandSet {
    private _controller: ILocksController;
    private _default_ttl: number = 10 * 1000;
    private _default_timeout: number = 60 * 1000;

    constructor(controller: ILocksController) {
        super();

        this._controller = controller;

        this.addCommand(this.makeGetLocks());
        this.addCommand(this.makeGetLockById());
        this.addCommand(this.makeTryAcquireLock());
        this.addCommand(this.makeAcquireLock());
        this.addCommand(this.makeReleaseLock());
    }

    private makeGetLocks(): ICommand {
        return new Command(
            'get_locks',
            new ObjectSchema(false)
                .withOptionalProperty('filter', new FilterParamsSchema())
                .withOptionalProperty('paging', new PagingParamsSchema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let filter = FilterParams.fromValue(args.get('filter'));
                let paging = PagingParams.fromValue(args.get('paging'));
                this._controller.getLocks(correlationId, filter, paging, callback);
            }
        );
    }

    private makeGetLockById(): ICommand {
        return new Command(
            'get_lock_by_id',
            new ObjectSchema(false)
                .withRequiredProperty('key', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let lockId = args.getAsString('key');
                this._controller.getLockById(correlationId, lockId, callback);
            }
        );
    }

    private makeTryAcquireLock(): ICommand {
        return new Command(
            'try_acquire_lock',
            new ObjectSchema(false)
                .withRequiredProperty('key', TypeCode.String)
                .withRequiredProperty('ttl', TypeCode.Integer)
                .withRequiredProperty('client_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any, result: string) => void) => {
                let key = args.getAsString('key');
                let ttl = args.getAsIntegerWithDefault('ttl', this._default_ttl);
                let client_id = args.getAsString('client_id');
                this._controller.tryAcquireLock(correlationId, key, ttl, client_id, (err, result) => {
                    callback(err, result.toString());
                });
            }
        );
    }

    private makeAcquireLock(): ICommand {
        return new Command(
            'acquire_lock',
            new ObjectSchema(false)
                .withRequiredProperty('key', TypeCode.String)
                .withRequiredProperty('ttl', TypeCode.Integer)
                .withRequiredProperty('timeout', TypeCode.Integer)
                .withRequiredProperty('client_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any) => void) => {
                let key = args.getAsString('key');
                let ttl = args.getAsIntegerWithDefault('ttl', this._default_ttl);
                let timeout = args.getAsIntegerWithDefault('timeout', this._default_timeout);
                let client_id = args.getAsString('client_id');
                this._controller.acquireLock(correlationId, key, ttl, timeout, client_id, callback);
            }
        );
    }

    private makeReleaseLock(): ICommand {
        return new Command(
            'release_lock',
            new ObjectSchema(false)
                .withRequiredProperty('key', TypeCode.String)
                .withRequiredProperty('client_id', TypeCode.String),
            (correlationId: string, args: Parameters, callback: (err: any) => void) => {
                let key = args.getAsString('key');
                let client_id = args.getAsString('client_id');
                this._controller.releaseLock(correlationId, key, client_id, callback);
            }
        );
    }
}