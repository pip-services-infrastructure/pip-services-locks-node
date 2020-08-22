# Configuration Guide <br/> Locks service Microservice

Cluster microservice configuration structure follows the 
[standard configuration](https://github.com/pip-services/pip-services3-container-node/doc/Configuration.md) 
structure. 

* [persistence](#persistence)
  - [memory](#persistence_memory)
  - [file](#persistence_file)
  - [mongodb](#persistence_mongodb)
* [controller](#controller)
* [service](#service)
  - [http](#service_http)

## <a name="persistence"></a> Persistence

The microservice supports three types of persistence: in-memory, flat files or MongoDB. In-memory and flat files are great for development and testing, 
while MongoDB is a good option with outstanding performance and scalability, suitable for demanding production installations. 
You can choose and configure the option that suits your needs.

For more information on this section read 
[Pip.Services Configuration Guide](https://github.com/pip-services/pip-services3-container-node/doc/Configuration.md#persistence)

### <a name="persistence_memory"></a> Memory

Memory persistence has the following configuration properties:
- options: object - Misc configuration options
  - max_page_size: number - Maximum number of items per page (default: 100)

Example:
```yaml
- descriptor: "pip-services-locks:persistence:memory:default:1.0"
  options:
    max_page_size: 100
```

### <a name="persistence_file"></a> File

Flat file persistence has the following configuration properties:
- path: string - file path where SystemEventV1 objects are stored. The object are written into the file in JSON format.
- options: object - Misc configuration options
  - max_page_size: number - Maximum number of items per page (default: 100)

Example:
```yaml
- descriptor: "pip-services-locks:persistence:file:default:1.0"
  path: "./data/locks"
```

### <a name="persistence_mongodb"></a> MongoDB

MongoDB persistence has the following configuration properties:
- connection(s): object - MongoDB connection properties
- options: object - (optional) MongoDB connection options. See: http://mongoosejs.com/docs/connections.html for more details.
- debug: boolean - (optional) Enables or disables connection debugging

Example:
```yaml
- descriptor: "pip-services-locks:persistence:file:default:1.0"
  collection: "locks"
  connection:
    uri: "mongodb://localhost/pipservicestest"
    host: "localhost"
    port: 27017
    database: "app"
  credential:
    username: "user_db"
    password: "passwd_db"
```

## <a name="controller"></a> Controller

The **controller** component containes the core business logic of the microservice.
Component has the following configuration properties:
- release_own_locks_only: boolean - if the parameter is set to true, it is allowed to release only own locks
- release_admin_id: string - client id that allows to release other clients locks despite the specified parameter release_own_locks_only
- clean_interval: 60000 - interval beatween call garbage collector for delete expired locks, if clean_interval=0 GC is stop 

Example:
```yaml
- descriptor: "pip-services-locks:controller:default:default:1.0"
  options:
    release_own_locks_only: true 
    release_admin_id: "12345"
```

## <a name="service"></a> Services

The **service** components (also called endpoints) expose external microservice API for the consumers. 
Each microservice can expose multiple APIs (HTTP/REST, Thrift or Seneca) and multiple versions of the same API type.
At least one service is required for the microservice to run successfully.

### <a name="service_http"></a> Http

HTTP/REST service has the following configuration properties:
- connection: object - HTTP transport configuration options
  - protocol: string - HTTP protocol - 'http' or 'https' (default is 'http')
  - host: string - IP address/hostname binding (default is '0.0.0.0')
  - port: number - HTTP port number

A detailed description of HTTP protocol version 1 can be found [here](HttpProtocolV1.md)

Example:
```yaml
- descriptor: "pip-services-locks:service:http:default:1.0"
  connection:
    protocol: "http"
    host: "0.0.0.0"
    port: 8080
```


For more information on this section read 
[Pip.Services Configuration Guide](https://github.com/pip-services/pip-services3-container-node/doc/Configuration.md#deps)
