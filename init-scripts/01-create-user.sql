-- Create user and grant privileges
CREATE USER oceanheart WITH PASSWORD 'admin';
ALTER USER oceanheart WITH SUPERUSER;
GRANT ALL PRIVILEGES ON DATABASE mydb TO oceanheart;
GRANT ALL PRIVILEGES ON SCHEMA public TO oceanheart;
