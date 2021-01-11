---
layout: page
title: PostgreSQL
toc: true
---

## Client
- `apt install postgresql-client`
- `psql`
  ```sh
  export PGPASSWORD=PASSWORD
  
  psql -h HOST -U USER -d DATABASE [-f SQL_FILE]
  ```

## Users & Roles

Due to [[REF](https://aws.amazon.com/blogs/database/managing-postgresql-users-and-roles/)]
> Users, groups, and roles are the same thing in PostgreSQL, with the only difference being that 
> users have permission to log in by default. The `CREATE USER` and `CREATE GROUP` statements are 
> actually aliases for the `CREATE ROLE` statement.

## Create

```sql
create role ROLE 
    [with
        [superuser]
        [createdb]
        [login password 'PASS']
    ]

create database DB 
    [with 
        [owner = ROLE]
    ]
```

- [[Create Role](https://www.postgresql.org/docs/13/sql-createrole.html)]
- [[Create DB](https://www.postgresql.org/docs/13/sql-createdatabase.html)]
- `select * from pg_catalog.pg_collation` for list of `lc_collate`


## Meta Data

### List user and roles
[[REF](https://www.postgresqltutorial.com/postgresql-list-users/)]
```sql
SELECT usename AS role_name,
  CASE 
     WHEN usesuper AND usecreatedb THEN 
	   CAST('superuser, create database' AS pg_catalog.text)
     WHEN usesuper THEN 
	    CAST('superuser' AS pg_catalog.text)
     WHEN usecreatedb THEN 
	    CAST('create database' AS pg_catalog.text)
     ELSE 
	    CAST('' AS pg_catalog.text)
  END role_attributes
FROM pg_catalog.pg_user
ORDER BY role_name desc
```

### Session
[[REF](https://dataedo.com/kb/query/postgresql/kill-session)]
```sql
-- List Sessions
select *
from pg_stat_activity

-- Kill Session - pg_terminate_backend()
select pg_terminate_backend(pid) 
from pg_stat_activity
where 
  pid = '18765'
  usename = 'USER'
  datname = 'DB_NAME'
  client_addr = 'CLIENT_IP'
```

## BackUp
- [[Incremental backups work in PostgreSQL](https://kcaps.medium.com/how-incremental-backups-work-in-postgresql-and-how-to-implement-them-in-10-minutes-d3689e8414d9)]