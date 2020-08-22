import { ProcessContainer } from 'pip-services3-container-node';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';

import { LocksServiceFactory } from '../build/LocksServiceFactory';

export class LocksProcess extends ProcessContainer{
    public constructor(){
        super('jobs', 'Locks orchestration microservice');

        this._factories.add(new LocksServiceFactory());
        this._factories.add(new DefaultRpcFactory());
    }
}