/** Simple demo Express app. */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require("express");
const cors = require("cors");
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
app.get("/", function (req, res) {
    return res.json('hello');
});
app.post("/images", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('POST IMAGES');
        console.log(req.body);
        const image = yield AmazonAPI.upload(req.body.image);
        console.log('REQ.BODY', req.body);
        return res.status(201).json({ image });
    });
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
// end
module.exports = app;
// export {};
