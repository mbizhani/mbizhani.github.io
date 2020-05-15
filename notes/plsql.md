---
layout: page
title: PL/SQL
toc: true
---

## Procedure

### Replace Arabic special characters by Farsi

```sql
create or replace procedure ar2fa_replacer(p_owner in varchar2, p_table in varchar2 default null) is
    v_count number;
begin
    dbms_output.put_line('--- Ar to Fa Replacer: owner=' || p_owner || ', table=' || p_table);

    for col in (select * from dba_tab_cols
                where owner = upper(p_owner)
                  and data_type like '%CHAR%'
                  and (p_table is null or table_name = upper(p_table))
                order by table_name)
    loop
        execute immediate 'select count(1) from ' || col.owner || '.' || col.table_name ||
                          ' where rownum=1 and (' ||
                          col.column_name || ' like ''%ي%'' or ' ||
                          col.column_name || ' like ''%ك%'')' into v_count;

        if v_count = 1 then
            dbms_output.put_line('Updating ' || col.owner || '.' || col.table_name || ' - ' || col.column_name);

            execute immediate 'update ' || col.owner || '.' || col.table_name || ' set ' || col.column_name ||
                              ' = replace(replace(' || col.column_name || ', ''ي'', ''ی''), ''ك'', ''ک'')';
            commit;
        end if;

    end loop;
end;
```
- Line 6, use `dba_tab_cols` instead of `all_tab_cols`
- Grant `select any dictionary` (line 6), `select any table` (line 12), and `update any table` (line 20) to procedure's owner **explicitly** (role `DBA` not enough)

### Drop Users with Search

```sql
begin
    for usr in (select username from all_users where username like 'TST%')
    loop
        execute immediate 'drop user '||usr.username||' cascade';
    end loop;
end;
```

## Trigger

### User logon

```sql
create or replace trigger user_default_nls after logon on database
declare
    v_count number;
begin
    execute immediate 'alter session set time_zone = ''UTC''';
    execute immediate 'alter session set nls_language = ''AMERICAN''';
    execute immediate 'alter session set nls_comp = ''LINGUISTIC''';
    
    select count(1) into v_count from SCHEMA1.VIEW1 where USERNAME = sys_context('USERENV','SESSION_USER');
    
    if v_count = 1 or sys_context('USERENV','SESSION_USER') in ('U1', 'U2') then
        execute immediate 'alter session set nls_sort = ''BINARY_CI''';
    else
        execute immediate 'alter session set nls_sort = ''BINARY''';
    end if;
end;
```
- In line 9, `SCHEMA1.VIEW1` is a view with the column `USERNAME` containing list of upper-cased username as exceptions.
- Line 7 and 12 provide search case insensitive in strings [REF](https://stackoverflow.com/questions/5391069/case-insensitive-searching-in-oracle).

**Note:** Appending `_CI` suffix for `NLS_SORT` results in case insensitivity due to [REF](https://oracle-base.com/articles/12c/column-level-collation-and-case-insensitive-database-12cr2).
