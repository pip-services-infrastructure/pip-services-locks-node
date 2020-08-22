# HTTP Protocol (version 1) <br/> Locks Microservice

Locks microservice implements a HTTP compatible API, that can be accessed on configured port.
All input and output data is serialized in JSON format. Errors are returned in [standard format]().

* [POST /v1/locks/get_locks](#operationget_locks)
* [POST /v1/locks/get_lock_by_id](#operationget_lock_by_id)
* [POST /v1/locks/try_acquire_lock](#operationtry_acquire_lock)
* [POST /v1/locks/acquire_lock](#operationacquire_lock)
* [POST /v1/locks/release_lock](#operationrelease_lock)

## Operations

### <a name="operation1"></a> Method: 'POST', route '/v1/locks/get_locks'

Get list of all locks

**Request body:**
- correlation_id: string - id that uniquely identifies transaction
- filter: FilterParams - filter parameters
- paging: PagingParams - paging parameters

**Response body:**
- lock: DataPage<LockV1> - Page with retrieved locks

### <a name="operation2"></a> Method: 'POST', route '/v1/locks/get_lock_by_id'

Get lock by key

**Request body:**
- correlation_id: string - id that uniquely identifies transaction
- key: string - a unique lock key

**Response body:**
- lock: LockV1 - finded lock

### <a name="operation3"></a> Method: 'POST', route '/v1/locks/try_acquire_lock'

Makes a single attempt to acquire a lock by its key

**Request body:**
- correlation_id: string - id that uniquely identifies transaction
- key: string - a unique lock key to acquire
- ttl: number - a lock timeout (time to live) in milliseconds

**Response body:**
- lock result

### <a name="operation4"></a> Method: 'POST', route '/v1/locks/acquire_lock'

Makes multiple attempts to acquire a lock by its key within give time interval

**Request body:**
- correlation_id: string - id that uniquely identifies transaction
- key: string - a unique lock key to acquire
- ttl: number - a lock timeout (time to live) in milliseconds
- timeout: number - a lock acquisition timeout

**Response body:**
- error or null for success

### <a name="operation5"></a> Method: 'POST', route '/v1/locks/release_lock'

Releases prevously acquired lock by its key

**Request body:**
- correlation_id: string - id that uniquely identifies transaction
- key: string - a unique lock key to release

**Response body:**
- error or null for success

