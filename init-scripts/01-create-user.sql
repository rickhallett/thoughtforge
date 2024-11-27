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

-- Grant database privileges
DO LANGUAGE plpgsql
$$
BEGIN
   GRANT ALL PRIVILEGES ON DATABASE thoughtforge TO oceanheart;
   GRANT ALL PRIVILEGES ON SCHEMA public TO oceanheart;
EXCEPTION
   WHEN undefined_object THEN
      -- Handle case where database doesn't exist yet
      NULL;
END
$$;
