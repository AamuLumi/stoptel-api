# StopTel Api

StopTel is a service to block any spam and sales number based on community reports.  
It's what was `Orange Téléphone` before Orange started to do some money with.

**!! Currently in development !!**

## Tasks

- [ ] Add nginx configuration to send sync files
- [ ] Reduce aggregate dumps by removing duplicates between dumps
- [ ] Security on microservices

## Start dev env

**Requirements :** Docker, node.js@14+

```
npm i
npm run infra:start
```

### Run reporter

```
npm run reporter:start:dev
```

### Run sync

```
npm run sync:start:dev
```

## Documentation

API is separated in 2 services : 
- **Reporter** : a microservice to report a number. 
- **Sync** : a microservice to send data to apps.

### Synchronization behavior

Each 20 minutes, the Sync service start a task to compute a CSV file (tab separated) with the changes of the last 20 minutes.  
If there's no change, no file is generated.  

Data works with a version code. It's a simple integer.  
Each time a sync is created, version is incremented.  
Dump names are `<previousVersion>-<nextVersion>.csv`.

We also added a logic to create aggregate file to reduce amount of files to load.
These files are created each 10, 100 or 1000 versions.  
There's also a `Sync service - GET /updateRoutes` to get the optimized path of files to load.  
The main goal of this strategy is to allow file to be stored on CDNs without any purge.

### Reporter

#### Routes

##### POST /report

- Query Parameters:
  - number: the phone number to report (string). Support numbers beginning with 0, 33, +33 and any variants with characters.
  - type: report type (string). Can be `spam`, `sales` or `malicious`.

###### Return

200 if ok. 400 if error (missing or invalid parameter).  
No body.

### Sync

#### Routes

##### GET /updateRoutes

- Query Parameters:
  - currentVersion: the current loaded data version (number).

###### Return

200 if ok. 400 if error (missing or invalid parameter).  
Body: an array of versions files to load to be updated.

Example with `currentVersion=0` and server version is 12:

```
[[0, 10], [10, 11], [11, 12]]
```
