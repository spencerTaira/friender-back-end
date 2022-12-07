const bodyParser = require("body-parser");

function parseBody(req, res, next) {
    bodyParser.raw({type: ["image/jpeg", "image/png"], limit: "5mb"});
    console.log("Works----------------------");
    return next();
}

module.exports = {
  parseBody
};
