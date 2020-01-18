---
layout: page
title: Oracle DB
toc: true
---

## Installation (Docker)
- Setup on Linux
```sh
mkdir OracleDB
chmod 777 OracleDB
docker run -d -it \
  -p 1521:1521 \
  -v $(pwd)/OracleDB:/ORCL \
  --restart=always \
  --name OracleDB \
  store/oracle/database-enterprise:12.2.0.1
```
- `docker ps` - wait until its status becomes healthy
- sys@CDB - `docker exec -it OracleDB /bin/bash -c "source /home/oracle/.bashrc; sqlplus '/ as sysdba'"`
- sys@PDB - `docker exec -it OracleDB /bin/bash -c "source /home/oracle/.bashrc; sqlplus sys/Oradoc_db1@ORCLPDB1 as sysdba"`
- SQLPlus Format ([stack](https://dba.stackexchange.com/questions/54149/how-to-make-sqlplus-output-appear-in-one-line))
  - `set linesize 300`
  - `column COL_NAME format a30`

## Admin
- OCI Connection String - `(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = myoracle)(PORT = 1521)))(CONNECT_DATA = (SERVICE_NAME = orcl)))`

### Export/Import
- `select * from dba_directories;`
- `create directory DIR as 'OS_DIR';`
- `expdp USER[/PASS][@SERVICE] schemas=S1[,S2,...] directory=DIR dumpfile=FILE.dmp logfile=FILE.log`
  - `parallel=DEGREE`
  - `exclude=statistics`
  - `content=metadata_only`
- `impdp USER[/PASS][@SERVICE] directory=DIR dumpfile=FILE.dmp logfile=FILE.log`
  - `schemas=S1[,S2,...]`
  - `remap_schema=SRC1:DEST1[,SRC2:DEST2,...]`
  - `parallel=DEGREE`
  - `transform=oid:n`

### CDB/PDB
- `show pdbs` or `select con_id, name, open_mode from v$pdbs;`
- `show con_name`
- `alter session set container=PDB`
- Create user on CDB
  - Common user - username must start with `c##` and consist only of ASCII characters ([stack](https://stackoverflow.com/questions/22886791/invalid-common-user-or-role-name))
  - Normal user - first `alter session set "_ORACLE_SCRIPT"=true;` and then create user

## Select
- `alter session set current_schema = USERNAME;`
- Use escape - `where username like 'DM\_%' escape '\'`

### Meta Data
- `select username, account_status, last_login from dba_users;`


## DDL
- `create user U profile P identified by "" default tablespace T temporary tablespace T;`
- `drop user USERNAME cascade;`
