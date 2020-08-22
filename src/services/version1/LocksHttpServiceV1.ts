import { CommandableHttpService } from 'pip-services3-rpc-node';
import { Descriptor } from 'pip-services3-commons-node';

export class LocksHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/locks');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-locks', 'controller', '*', '*', '1.0'));
    }
}