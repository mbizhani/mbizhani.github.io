---
layout: page
title: PL/SQL
toc: true
---

## Procedure

- Replace Arabic special characters by Farsi
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
							  col.column_name || ' like ''%ي%''' || ' or ' ||
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
  - Grant `select any dictionary` to procedure's owner 

## Trigger

- User logon
```sql
create or replace trigger user_default_nls after logon on database 
begin
   execute immediate 'alter session set time_zone = ''UTC''';
   execute immediate 'alter session set nls_language = ''AMERICAN''';
end;
```