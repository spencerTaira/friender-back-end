"use strict";
/** Simple demo Express app. */
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
// const cors = require("cors");
const app = express();
const AmazonAPI = require("./s3AmazonAPI");
// useful error class to throw
const { NotFoundError, BadRequestError } = require("./expressError");
// process JSON body => req.body
app.use(express.json());
// process traditional form data => req.body
app.use(express.urlencoded());
app.post("/images", function (req, res) {
    const image = AmazonAPI.upload(req.body);
    return res.status(201).json({ image });
});
/** 404 handler: matches unmatched routes. */
app.use(function (req, res) {
    throw new NotFoundError();
});
/** Error handler: logs stacktrace and returns JSON error message. */
app.use(function (err, req, res, next) {
    const status = err.status || 500;
    const message = err.message;
    if (process.env.NODE_ENV !== "test")
        console.error(status, err.stack);
    return res.status(status).json({ error: { message, status } });
});
