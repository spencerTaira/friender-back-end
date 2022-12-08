CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL
    CHECK (position('@' IN email) > 1),
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  zip TEXT NOT NULL,
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users_viewing_relationship (
  user_viewer INTEGER NOT NULL
    REFERENCES users ON DELETE CASCADE,
  user_viewee INTEGER NOT NULL
    REFERENCES users ON DELETE CASCADE,
  is_liked BOOLEAN NOT NULL,
  PRIMARY KEY (user_viewer, user_viewee)
);

CREATE TABLE hobbies (
  hobby TEXT PRIMARY KEY
);

CREATE TABLE interests (
  interest TEXT PRIMARY KEY
);

CREATE TABLE users_hobbies (
  "user_id" INTEGER NOT NULL
    REFERENCES users on DELETE CASCADE,
  hobby TEXT NOT NULL
    REFERENCES hobbies on DELETE CASCADE,
  PRIMARY KEY ("user_id", hobby)
);

CREATE TABLE users_interests (
  "user_id" INTEGER NOT NULL
    REFERENCES users on DELETE CASCADE,
  interest TEXT NOT NULL
    REFERENCES interests on DELETE CASCADE,
  PRIMARY KEY ("user_id", interest)
);

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  msg TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  user_sender INTEGER NOT NULL
    REFERENCES users ON DELETE CASCADE,
  user_receiver INTEGER NOT NULL
    REFERENCES users ON DELETE CASCADE
);

CREATE TABLE images (
  image_url TEXT PRIMARY KEY,
  "user_id" INTEGER NOT NULL
    REFERENCES users on DELETE CASCADE
);
