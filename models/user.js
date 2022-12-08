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
      `SELECT email,
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
    hobbies,
    interests,
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

    let userHobbies = [];
    let userInterests = [];

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
           [user.id, hobby]
        );
        userHobbies.push(hobbyResult.rows[0].hobby);
      }
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

        const interestResult = await db.query(
          `INSERT INTO users_interests
           (user_id, interest)
           VALUES ($1, $2)
           RETURNING interest`,
           [user.id, interest]
        );
        userInterests.push(interestResult.rows[0].interest);
      }
    }

    user["hobbies"] = userHobbies;
    user["interests"] = userInterests;

    return user;
  }
}

module.exports = User;

// METHODS

  // AUTHENTICATE
  // REGISTER
  // GET SPECIFIC USER
  // GET FRIENDS
  // GET NON-VIEWED USERS
  // LIKE/DISLIKE
  // UPDATE
  // DELETE
