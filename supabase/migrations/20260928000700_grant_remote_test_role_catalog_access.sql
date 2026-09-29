grant usage on schema public, storage to cli_login_postgres;
grant all privileges on all tables in schema public to cli_login_postgres;
grant usage, select on all sequences in schema public to cli_login_postgres;
grant select on storage.buckets to cli_login_postgres;
