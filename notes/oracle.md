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
- Connection Info:
  - host: `localhost`
  - port: `1521`
  - service: `orclpdb1.localdomain`
  - user: `sys as sysdba`
  - password: `Oradoc_db1`
  - JDBC URL: `jdbc:oracle:thin:@localhost:1521/orclpdb1.localdomain`
- SQLPlus Format ([stack](https://dba.stackexchange.com/questions/54149/how-to-make-sqlplus-output-appear-in-one-line))
  - `set linesize 300`
  - `column COL_NAME format a30`

## Admin
- OCI Connection String - `(DESCRIPTION = (ADDRESS_LIST = (ADDRESS = (PROTOCOL = TCP)(HOST = myoracle)(PORT = 1521)))(CONNECT_DATA = (SERVICE_NAME = orcl)))`
- Kill Sessions
```sql
select 'alter system kill session '''||sid||','||serial#||''' immediate;' 
from v$session 
where
  1=1
--and username='?'
--and osuser='?'
--and schemaname='?'
--and machine='?'
```
- Gather Statistics ([REF](https://oracle-base.com/articles/misc/cost-based-optimizer-and-database-statistics))
  - `dbms_stats.gather_schema_stats('SCHEMA');`
  - `dbms_stats.gather_table_stats('SCHEMA', 'TABLE');`

### Export/Import
- `select * from dba_directories`
- `create directory DIR as 'OS_DIR'`
- `expdp USER[/PASS][@SERVICE] schemas=S1[,S2,...] directory=DIR dumpfile=FILE.dmp logfile=FILE.log`
  - `parallel=DEGREE`
  - `exclude=statistics`
  - `content=metadata_only`
- `impdp USER[/PASS][@SERVICE] directory=DIR dumpfile=FILE.dmp logfile=FILE.log`
  - `schemas=S1[,S2,...]`
  - `remap_schema=SRC1:DEST1[,SRC2:DEST2,...]`
  - `parallel=DEGREE`
  - `transform=oid:n` (for proc/func to get new OID)
- Data Pump Jobs
  - `select * from dba_datapump_jobs`

### CDB/PDB
- `show pdbs` or `select con_id, name, open_mode from v$pdbs`
- `show con_name`
- `alter session set container=PDB`
- Create user on CDB
  - Common user - username must start with `c##` and consist only of ASCII characters ([stack](https://stackoverflow.com/questions/22886791/invalid-common-user-or-role-name))
  - Normal user - first `alter session set "_ORACLE_SCRIPT"=true` and then create user
- Change password for user `sys` [[REF](https://community.oracle.com/tech/apps-infra/discussion/4193723/password-expiration-date-not-changing-for-user-sys)]
  - Login to CDB
  - `alter user sys identified by "PASS" container=all;`

### SqlPlus Command
- `sqlplus '/ as sysdba'` - connect as `sys`
- `echo SQL | sqlplus USER[/PASSWORD][@SERVICE]` - execute simple `SQL` statement

## Select
- `alter session set current_schema = U`
- Use escape - `where username like 'DM\_%' escape '\'`
- Number Format
  - `to_char(NO, 'fm0000.000')` - padding zero, number of `0` characters show possible padding
  - `to_char(NO, 'fm9,999.99')` - thousand separator, number of `9` characters show possible number output
  - **note:** on showing multiple `#` character, add more `0` or `9` to format string

## Meta Data
- `select username, account_status, last_login from dba_users`

- Parent/Child or FK/PK Relation
```sql
select
    'create index '||ch.owner||'.IDX_'||ch.constraint_name||
      ' on '||ch.owner||'.'||ch.table_name||'('||chc.column_name||');' create_idx_fk,
    -- child cols
    ch.constraint_name ch_fk_const, ch.owner ch_owner, ch.table_name ch_table, chc.column_name ch_col,
    -- parent cols
    pr.constraint_name pr_pk_const, pr.owner pr_owner, pr.table_name pr_table, prc.column_name pr_col
    -- child tables
from all_constraints ch
join all_cons_columns chc on chc.constraint_name = ch.constraint_name and chc.owner=ch.owner
-- parent tables
join all_constraints pr on pr.constraint_name = ch.r_constraint_name and pr.owner = ch.r_owner
join all_cons_columns prc on prc.constraint_name = pr.constraint_name and prc.owner = pr.owner
where
    ch.constraint_type = 'R'
    --and pr.constraint_name = ''
    --and pr.owner = ''
    --and pr.table_name = ''
```

- Schema Size
```sql
select * from
(
    select owner, sum(bytes)/1024/1024/1024 schema_size_gig
    from dba_segments
    --where
        --owner like 'DDS%'
    group by owner
)
order by schema_size_gig desc
```

## DDL

### User
- `create user U profile P identified by "" default tablespace T temporary tablespace T`
- `drop user U cascade`

### Table
- Create
```sql
create table t_T1 (
    id number(10, 0),           -- PK, @Id
    c_COL1 varchar2(255 char),  -- Character/String
    b_COL2 number(1, 0),        -- Boolean
    n_COL3 number(?, ?),        -- Any Number
    d_COL4 date,                -- Date
    e_COL5 number(?, 0),        -- Enumeration
    fk_COL number(?, ?),        -- Foreign Key 
    
    constraint pk_T1 primary key(id),
    constraint fk_COL2PARENT foreign key(fk_COL) references t_PARENT(id),
    constraint uc_T1_X unique (C1 [, C2, ...]),
    constraint ch_T1_COL2 check (b_COL2 in (0, 1)),
    constraint ch_T1_COL6 check (e_COL5 in (...))
)
```

- Alter ([ref](https://www.techonthenet.com/oracle/tables/alter_table.php))
  - `alter table T1 rename to T2`
  - `alter table T1 add COL TYPE`
  - `alter table T1 modify COL TYPE`
  - `alter table T1 rename column COL to COL_NEW`
  - `alter table T1 drop column COL`
  - `alter table T1 enable/disable constraint CONST`
  - `alter table T1 drop constraint CONST`

### DB Link
- Create 
```sql
create database link L
   connect to U identified by "P"
   using '(description=(address=(protocol=tcp)(host=H)(port=1521))(connect_data=(service_name=S)))'
```
