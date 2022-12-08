"use strict";

/** Simple demo Express app. */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const AmazonAPI = require("./s3AmazonAPI");

// useful error class to throw
const { NotFoundError } = require("./expressError");

const { authenticateJWT } = require("./middleware/auth");
const usersRoutes = require("./routes/users");
const messagesRoutes = require("./routes/messages");

const app = express();

app.use(cors());
app.use(express.json());
app.use(authenticateJWT);

app.use("/users", usersRoutes);
app.use("/messages", messagesRoutes);

/****************************************************************************
 ***************** ROUTES ***************************************************
 ****************************************************************************/

app.post("/images", upload.array("images[]"), async function(req, res) {
  console.log('POST IMAGES');
  console.log(req.files, "THIS IS THE REQ FILE");
//   console.log(req.file.buffer, "THIS IS THE REQ FILE BUFFER")
//   console.log(req.files[0].path, "THIS IS THE REQ FILE PATH");

  const responsesP = [];
  try {
    for (const file of req.files) {
        responsesP.push(AmazonAPI.upload(file));
    }
    const responses = await Promise.allSettled(responsesP);
    console.log('RESPONSES', responses);
    for (const response of responses) {
        if (response.status !== 'fulfilled') {
            throw new Error('IMAGE UPLOAD FAILED');
        }
    }

    const imageURLs = responses.map(r => r.value);

    console.log('URLS STRING', urlsString);
    console.log('IMAGE URLS', imageURLs);
    return res.json({ imageURLs })

  } catch(err) {
    console.log(err, "THIS IS THE ERROR!!!!");
  }
//   console.log('REQ.BODY', req.body);
//   return res.status(201).json("Saved image successfully");
});

/** 404 handler: matches unmatched routes. */
app.use(function (req, res) {
  throw new NotFoundError();
});

/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
  const status = err.status || 500;
  const message = err.message;
  if (process.env.NODE_ENV !== "test") console.error(status, err.stack);
  return res.status(status).json({ error: { message, status } });
});
// end


module.exports = app;
