-- Create user and grant privileges
DO
$do$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'oceanheart') THEN

      CREATE USER oceanheart WITH PASSWORD 'admin';
   END IF;
END
$do$;

ALTER USER oceanheart WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE mydb TO oceanheart;
GRANT ALL PRIVILEGES ON SCHEMA public TO oceanheart;
