-- Create dblink extension
CREATE EXTENSION IF NOT EXISTS dblink;

-- Create database if it does not exist
DO LANGUAGE plpgsql
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_database
      WHERE datname = 'thoughtforge') THEN

      PERFORM dblink_exec('dbname=postgres', 'CREATE DATABASE thoughtforge');
   END IF;
END
$$;

-- Create user and grant privileges
DO LANGUAGE plpgsql
$$
BEGIN
   IF NOT EXISTS (
      SELECT FROM pg_catalog.pg_roles
      WHERE  rolname = 'oceanheart') THEN

      CREATE USER oceanheart WITH PASSWORD 'admin' SUPERUSER;
   ELSE
      ALTER USER oceanheart WITH SUPERUSER;
   END IF;
END
$$;

-- Connect to the thoughtforge database and grant privileges
\c thoughtforge;

-- Grant database privileges
GRANT ALL PRIVILEGES ON DATABASE thoughtforge TO oceanheart;
GRANT ALL PRIVILEGES ON SCHEMA public TO oceanheart;
