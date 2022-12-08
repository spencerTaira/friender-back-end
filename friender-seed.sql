-- all test users have the password "password"

INSERT INTO users (email, password, first_name, last_name, hobbies, interests, zip, is_admin)
VALUES (
  'test1@email.com',
  '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
  'Test',
  'User1',
  'Chess',
  'Long walks on the beach',
  '94702',
  FALSE
), (
  'test2@email.com',
  '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
  'Test',
  'User2',
  'Smash Bros.',
  'Medium walks on the beach',
  '94590',
  FALSE
), (
  'test3@email.com',
  '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
  'Test',
  'Admin',
  'Programming',
  'Short walks on the beach',
  '95618',
  TRUE
);


INSERT INTO users_relationship (user_views, user_viewed, is_liked)
VALUES (1, 2, TRUE), (2, 1, FALSE), (1, 3, TRUE), (3, 1, TRUE);


INSERT INTO messages (msg, user_sender, user_receiver)
VALUES ('Hello', 1, 3), ('Sup', 3, 1);

INSERT INTO images (image_url, userID)
VALUES (
  'https://r28-friender-spencer.s3.us-west-1.amazonaws.com/957a1c60-72a9-4dbb-bf69-3166e56ba73f',
  1
), (
  'https://r28-friender-spencer.s3.us-west-1.amazonaws.com/96626fcc-efe8-4e15-b5a0-fa88f12fb85f',
  2
);


-- Finding matches

-- SELECT u1.user_viewed
--   FROM users_relationship AS u1
--     JOIN users_relationship AS u2
--       ON u1.user_viewed = u2.user_views AND u1.user_views = u2.user_viewed
--   WHERE u1.user_views = 2 AND u1.is_liked = true AND u2.is_liked = true;

-- Finding messages

-- SELECT *
--   FROM messages
--   WHERE user_sender = 1 OR user_receiver = 1
--   ORDER BY sent_at;


-- Finding users who haven't seen eachother yet

-- SELECT u.id FROM users_relationship as ur
--   JOIN users as u
--     ON ur.user_viewed != u.id
-- WHERE ur.user_views = 3 AND u.id != 3;