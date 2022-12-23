"use strict";

/** Routes for users. */

const jsonschema = require("jsonschema");

const express = require("express");
const {
  ensureCorrectUserOrAdmin,
  ensureAdmin,
  ensureLoggedIn
} = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");
const { createToken } = require("../helpers/tokens");
const userNewSchema = require("../schemas/userNew.json");
const userUpdateSchema = require("../schemas/userUpdate.json");

const router = express.Router();

/** POST / { user }  => { user, token }
 *
 * Adds a new user. This is not the registration endpoint --- instead, this is
 * only for admin users to add new users. The new user being added can be an
 * admin.
 *
 * This returns the newly created user and an authentication token for them:
 *  {user: { email, firstName, lastName, zip, isAdmin }, token }
 *
 * Authorization required: admin
 **/

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userNewSchema, {
      required: true,
    });
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const user = await User.register(req.body);
    const token = createToken(user);
    return res.status(201).json({ user, token });
  } catch (err) {
    return next(err);
  }
});

/** GET / => { users: [ {email, firstName, lastName, zip }, ... ] }
 *
 * Returns list of all users.
 *
 * Authorization required: admin
 **/

router.get("/", ensureAdmin, async function (req, res, next) {
  try {
    const users = await User.findAll();
    return res.json({ users });
  } catch (err) {
    return next(err);
  }
});

/** GET /[username] => { user }
 *
 * Returns { email, firstName, lastName, zip, hobbies, interests }
 *  where hobbies is like: ["hobby1", "hobby2", "hobby3", ...]
 *  where interests is like: ["interests1", "interests2", "interests3", ...]
 *
 * Authorization required: logged-in
 **/

router.get(
  "/:id",
  ensureLoggedIn,
  async function (req, res, next) {
    try {
      const user = await User.get(Number(req.params.id));
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** PATCH /[username] { user } => { user }
 *
 * Data can include:
 *   { firstName, lastName, password, zip, hobbies, interests }
 *     where hobbies is like: ["hobby1", "hobby2", "hobby3", ...]
 *     where interests is like: ["interests1", "interests2", "interests3", ...]
 *
 * Returns { email, firstName, lastName, zip, hobbies, interests, isAdmin }
 *
 * Authorization required: admin or same-user-as-:username
 **/

router.patch(
  "/:id",
  // ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, userUpdateSchema, {
        required: true,
      });
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }

      const user = await User.update(Number(req.params.id), req.body);
      return res.json({ user });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization required: admin or same-user-as-:id
 **/

router.delete(
  "/:id",
  // ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      await User.remove(Number(req.params.id));
      return res.json({ deleted: req.params.id });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:id/friends",
  // ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const friends = await User.getFriends(Number(req.params.id));
      return res.json({ friends });
    } catch (err) {
      return next(err);
    }
  }
);

router.get(
  "/:id/strangers",
  // ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const strangers = await User.getStrangers(Number(req.params.id));
      return res.json({ strangers });
    } catch (err) {
      return next(err);
    }
  }
);

router.post(
  "/choose",
  // ensureCorrectUserOrAdmin,
  async function (req, res, next) {
    try {
      const relationship = await User.chooseFriend(
                                  req.body.id1,
                                  req.body.id2,
                                  req.body.isLiked
                            );
      return res.json({ relationship });
    } catch (err) {
      return next(err);
    }
  }
)

router.put(
  "/:id/hobbies",
  async function (req, res, next) {
    try {
      const hobbies = await User.updateHobbies(Number(req.params.id), req.body);
      return res.json({ hobbies });
    } catch (err) {
      return next(err);
    }
  }
)
// router.post(
//   "/images",
//   // ensureCorrectUserOrAdmin,
//   async function (req, res, next) {
//     try {
//       const imageURLs = await User.insertImages(req.body.id, req.body.imageURLs)
//       return res.json({ imageURLs });
//     } catch (err) {
//       return next(err);
//     }
//   }
// )

module.exports = router;
