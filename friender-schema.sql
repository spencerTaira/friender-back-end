-- CREATE TABLE companies (
--   handle VARCHAR(25) PRIMARY KEY CHECK (handle = lower(handle)),
--   name TEXT UNIQUE NOT NULL,
--   num_employees INTEGER CHECK (num_employees >= 0),
--   description TEXT NOT NULL,
--   logo_url TEXT
-- );

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email) > 1),
  password TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  hobbies TEXT NOT NULL,
  interests TEXT NOT NULL,
  zip TEXT NOT NULL,
  photo TEXT NOT NULL DEFAULT "",
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE friends (
  user_views INTEGER
    REFERENCES users ON DELETE CASCADE,
  user_viewed INTEGER
    REFERENCES users ON DELETE CASCADE,
  is_liked BOOLEAN NOT NULL,
  PRIMARY_KEY (user_views, user_viewed)
);

-- CREATE TABLE jobs (
--   id SERIAL PRIMARY KEY,
--   title TEXT NOT NULL,
--   salary INTEGER CHECK (salary >= 0),
--   equity NUMERIC CHECK (equity <= 1.0),
--   company_handle VARCHAR(25) NOT NULL
--     REFERENCES companies ON DELETE CASCADE
-- );

-- CREATE TABLE applications (
--   username VARCHAR(25)
--     REFERENCES users ON DELETE CASCADE,
--   job_id INTEGER
--     REFERENCES jobs ON DELETE CASCADE,
--   PRIMARY KEY (username, job_id)
-- );
