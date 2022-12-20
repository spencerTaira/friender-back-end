"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

/** Related functions for users. */

class User {
  /** authenticate user with email, password.
   *
   * Returns { email, first_name, last_name, zip, is_admin }
   *
   * Throws UnauthorizedError is user not found or wrong password.
   **/

  static async authenticate(email, password) {
    // try to find the user first
    const result = await db.query(
      `SELECT     id,
                  email,
                  password_hash AS "passwordHash",
                  first_name AS "firstName",
                  last_name AS "lastName",
                  zip,
                  is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (user) {
      // compare hashed password to a new hash from password
      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (isValid === true) {
        delete user.passwordHash;
        return user;
      }
    }

    throw new UnauthorizedError("Invalid email/password");
  }

  /** Register user with data.
   *
   * Returns { email, firstName, lastName, zip, hobbies, interests, isAdmin }
   *
   * Throws BadRequestError on duplicates.
   **/

   static async register({
    email,
    password,
    firstName,
    lastName,
    zip,
    isAdmin,
  }) {
    const duplicateCheck = await db.query(
      `SELECT email
           FROM users
           WHERE email = $1`,
      [email]
    );

    if (duplicateCheck.rows[0]) {
      throw new BadRequestError(`Duplicate email: ${email}`);
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);


    const userResult = await db.query(
      `INSERT INTO users
      (email,
        password_hash,
        first_name,
        last_name,
        zip,
        is_admin)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email, first_name AS "firstName", last_name AS "lastName", zip, is_admin AS "isAdmin"`,
        [email, hashedPassword, firstName, lastName, zip, isAdmin]
        );

    const user = userResult.rows[0];

    // user["hobbies"] = userHobbies;
    // user["interests"] = userInterests;

    return user;
  }

  /** Gets user with data.
   *
   *  Input: id - number
   *  Returns { id, email, firstName, lastName, zip, hobbies, interests, isAdmin }
   *    where hobbies is like: ["hobby1", "hobby2", "hobby3", ...]
 *      where interests is like: ["interests1", "interests2", "interests3", ...]
   *
   *  Throws NotFoundError if no user exists
   **/
  static async get(id) {
    const userRes = await db.query(
      `SELECT
          id,
          email,
          first_name AS "firstName",
          last_name AS "lastName",
          zip,
          is_admin AS "isAdmin"
        FROM users
        WHERE id = $1`,
      [id]
    );

    const user = userRes.rows[0];

    if (!user) throw new NotFoundError(`No user: ${id}`);

    const userHobbiesRes = await db.query(
      `SELECT
          hobby
        FROM users_hobbies
        WHERE user_id = $1`,
      [id]
    );

    console.log('USER HOBBIES RES', userHobbiesRes);
    user.hobbies = userHobbiesRes.rows.map(h => h.hobby);

    const userInterestsRes = await db.query(
      `SELECT
          interest
        FROM users_interests
        WHERE user_id = $1`,
      [id]
    );

    user.interests = userInterestsRes.rows.map(i => i.interest);

    return user;
  }

  /** Update user data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include:
   *   { firstName, lastName, password, hobbies, interests, zip, isAdmin }
   *
   * Returns { id, email, firstName, lastName, zip, hobbies, interests, isAdmin }
   *    where hobbies is like: ["hobby1", "hobby2", "hobby3", ...]
 *      where interests is like: ["interests1", "interests2", "interests3", ...]
   *
   * Throws NotFoundError if not found.
   *
   * WARNING: this function can set a new password or make a user an admin.
   * Callers of this function must be certain they have validated inputs to this
   * or a serious security risks are opened.
   */

   static async update(id, data) {
    // if (data.password) {
    //   data.password = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
    // }

    console.log('Update Data', data);
    const {hobbies, interests} = data;
    delete data.hobbies;
    delete data.interests;
    console.log('AFTER DELETE', data);

    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          firstName: "first_name",
          lastName: "last_name",
          isAdmin: "is_admin",
        });
    const userVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE users
                      SET ${setCols}
                      WHERE id = ${userVarIdx}
                      RETURNING id,
                                email,
                                first_name AS "firstName",
                                last_name AS "lastName",
                                zip,
                                is_admin AS "isAdmin"`;
    const result = await db.query(querySql, [...values, id]);
    const user = result.rows[0];

    if (!user) throw new NotFoundError(`No user: ${username}`);

    /*
    initial state:
    User exists
        User has hobbies ['smash', 'chess']

    update state:
    Update user data
        User has hobbies ['smash', 'checkers']

    check if hobby exists in hobbies table
        if so, we need to check if users_hobbies exists
    */

    const userHobbies = [];
    const userInterests = [];

    if(hobbies.length > 0) {
      for(const hobby of hobbies) {
        const hobbyDupeCheck = await db.query(
          `SELECT hobby
              FROM hobbies
              WHERE hobby = $1`,
          [hobby]
        );

        if(!hobbyDupeCheck.rows[0]) {
          await db.query(
            `INSERT INTO hobbies
            (hobby)
            VALUES ($1)`,
            [hobby]
          );
        }
        try {
          const hobbyResult = await db.query(
            `INSERT INTO users_hobbies
            (user_id, hobby)
            VALUES ($1, $2)
                RETURNING hobby`,
                [id, hobby]
          );
          userHobbies.push(hobbyResult.rows[0].hobby);
        } catch (err) {
          userHobbies.push(hobby);
        }
      }
    } else {
      await db.query(
        `DELETE FROM users_hobbies
          WHERE user_id = $1
          RETURNING user_id`,
        [id]
      );
    }

    if(interests.length > 0) {
      for(const interest of interests) {
        const interestDupeCheck = await db.query(
          `SELECT interest
              FROM interests
              WHERE interest = $1`,
          [interest]
        );

        if(!interestDupeCheck.rows[0]) {
          await db.query(
            `INSERT INTO interests
            (interest)
            VALUES ($1)`,
            [interest]
          );
        }

        try {
          const interestResult = await db.query(
            `INSERT INTO users_interests
             (user_id, interest)
             VALUES ($1, $2)
             RETURNING interest`,
             [id, interest]
          );
          userInterests.push(interestResult.rows[0].interest);
        } catch (err) {
          userInterests.push(interest);
        }
      }
    } else {
      await db.query(
        `DELETE FROM users_interests
          WHERE user_id = $1
          RETURNING user_id`,
        [id]
      );
    }

    user["hobbies"] = userHobbies;
    user["interests"] = userInterests;

    delete user.password;
    return user;
  }

  /** Delete given user from database; returns undefined */

  static async remove(id) {
    const result = await db.query(
      `DELETE
        FROM users
        WHERE id = $1
        RETURNING id`,
      [id]
    );
    const user = result.rows[0];

    if(!user) throw new NotFoundError(`No user: ${id}`);
  }

  /** Gets all of user's friends */

  static async getFriends(id) {
    const results = await db.query(
      `SELECT u1.user_viewee
         FROM users_viewing_relationship AS u1
           JOIN users_viewing_relationship AS u2
             ON u1.user_viewee = u2.user_viewer AND u1.user_viewer = u2.user_viewee
         WHERE u1.user_viewer = $1 AND u1.is_liked = true AND u2.is_liked = true;`,
         [id]
    );
    const friendsP = results.rows.map(async f => await this.get(f.user_viewee));
    console.log("THIS IS FRIENDS PROMISE!!!", friendsP);

    const friends = (await Promise.allSettled(friendsP)).map(f => f.value);
    console.log("THIS IS FRIENDS ARRAY!!!", friends);

    return friends;
  }

  /** Get non-viewed users */

  static async getStrangers(id) {
    const results = await db.query(
      `SELECT u.id
         FROM users AS u
         WHERE u.id != ALL(
           SELECT uvr.user_viewee
           FROM users_viewing_relationship AS uvr
           WHERE uvr.user_viewer = $1
         ) AND u.id != $1;`,
       [id]
    );
    const strangersP = results.rows.map(async s => await this.get(s.id));
    console.log("THIS IS STRANGERS PROMISE!!!", strangersP);

    const strangers = (await Promise.allSettled(strangersP)).map(s => s.value);
    console.log("THIS IS STRANGERS ARRAY!!!", strangers);

    return strangers;
  }

  /**
   * Create relationship between two users in users_viewing_relationship
   */
  static async chooseFriend(userId, strangerId, isLiked) {
    try {
      const result = await db.query(
        `INSERT INTO users_viewing_relationship
         (user_viewer, user_viewee, is_liked)
         VALUES ($1, $2, $3)
         RETURNING
          user_viewer AS "userViewer",
          user_viewee AS "userViewee",
          is_liked AS "isLiked"`,
         [userId, strangerId, isLiked]
      );

      return result.rows[0];

    } catch (err) {
      throw new BadRequestError(
        `${userId} has already chosen ${strangerId} as friend or foe`
      );
    }
  }

  /** Insert images with link to user into the database */
  static async insertImages(id, urls) {
    const imageUrls = [];

    if (urls.length > 0) {
      for (const url of urls) {
        try {
          const result = await db.query(
            `INSERT INTO images
            (image_url, user_id)
            VALUES ($1, $2)
            RETURNING
              image_url`,
            [url, id]
          );
          imageUrls.push(result.rows[0].image_url);
        } catch (err) {
          imageUrls.push(url);
        }
      }
    }

    return imageUrls;
  }

  static async updateHobbies(id, hobbies) {
    let userHobbies = [];

    if(hobbies.length > 0) {
      for(const hobby of hobbies) {
        const hobbyDupeCheck = await db.query(
          `SELECT hobby
              FROM hobbies
              WHERE hobby = $1`,
          [hobby]
        );

        if(!hobbyDupeCheck.rows[0]) {
          await db.query(
            `INSERT INTO hobbies
            (hobby)
            VALUES ($1)`,
            [hobby]
          );
        }

        const hobbyResult = await db.query(
          `INSERT INTO users_hobbies
           (user_id, hobby)
           VALUES ($1, $2)
           RETURNING hobby`,
           [id, hobby]
        );
        userHobbies.push(hobbyResult.rows[0].hobby);
      }
    }

    return userHobbies;
  }

  static async updateInterests(id, interests) {
    let userInterests = [];

    if(interests.length > 0) {
      for(const interest of interests) {
        const interestDupeCheck = await db.query(
          `SELECT interest
              FROM interests
              WHERE interest = $1`,
          [interest]
        );

        if(!interestDupeCheck.rows[0]) {
          await db.query(
            `INSERT INTO interests
            (interest)
            VALUES ($1)`,
            [interest]
          );
        }

        const interestResult = await db.query(
          `INSERT INTO users_interests
           (user_id, interest)
           VALUES ($1, $2)
           RETURNING interest`,
           [id, interest]
        );
        userInterests.push(interestResult.rows[0].interest);
      }
    }

    return userInterests;
  }
}

module.exports = User;

// METHODS

  // AUTHENTICATE - Done
  // REGISTER - Done
  // GET SPECIFIC USER - Done
  // GET FRIENDS - Done
  // GET NON-VIEWED USERS - Done
  // LIKE/DISLIKE
  // UPDATE - Done
  // DELETE - Done
