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
  photo TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users_relationship (
  user_views INTEGER
    REFERENCES users ON DELETE CASCADE,
  user_viewed INTEGER
    REFERENCES users ON DELETE CASCADE,
  is_liked BOOLEAN NOT NULL,
  PRIMARY KEY (user_views, user_viewed)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  msg TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  user_sender INTEGER
    REFERENCES users ON DELETE CASCADE,
  user_receiver INTEGER
    REFERENCES users ON DELETE CASCADE
);
