-- Allow public to read admin_users for authentication
CREATE POLICY "Allow public to read admin users for login"
  ON admin_users
  FOR SELECT
  TO public
  USING (true);