import { ObjectSchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

export class LockV1Schema extends ObjectSchema {
    constructor() {
        super();

        this.withRequiredProperty('key', TypeCode.String);
        this.withRequiredProperty('client_id', TypeCode.String);
        this.withRequiredProperty('created', TypeCode.DateTime);
        this.withRequiredProperty('expire_time', TypeCode.DateTime);
    }
}