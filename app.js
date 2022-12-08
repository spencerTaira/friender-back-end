"use strict";

/** Simple demo Express app. */

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const upload = multer();

const app = express();

const AmazonAPI = require("./s3AmazonAPI");

// useful error class to throw
const { NotFoundError, BadRequestError } = require("./expressError");

const { parseBody } = require("./middleware");

app.use(cors());
// process JSON body => req.body
app.use(express.json());

// process traditional form data => req.body
app.use(express.urlencoded());

app.get("/", function(req,res) {
  return res.json('hello')
})

app.post("/images", upload.array("images[]"), async function(req, res) {
  console.log('POST IMAGES');
  console.log(req.files, "THIS IS THE REQ FILE");
//   console.log(req.file.buffer, "THIS IS THE REQ FILE BUFFER")
//   console.log(req.files[0].path, "THIS IS THE REQ FILE PATH");

  let image;
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
    //TODO: input files into our database (we can use .join(', ') to store and .split to retrieve)
    const imageURLs = responses.map(r => r.value);
    console.log('IMAGE URLS', imageURLs);
    return res.json({ imageURLs })

  } catch(err) {
    console.log(err, "THIS IS THE ERROR!!!!");
  }
//   console.log('REQ.BODY', req.body);
//   return res.status(201).json("Saved image successfully");
});

// app.post("/images",
//     bodyParser.raw({type: ["image/jpeg", "image/png"], limit: "5mb"}),
//     (req, res) => {
//         try {
//             console.log(req.body);
//             fs.writeFile("image.jpeg", req.body, (error) => {
//                 if (error) {
//                     throw error;
//                 }
//             });
//         res.sendStatus(200);
//     } catch (error) {
//         res.sendStatus(500);
//         }
// });



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
