var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require("dotenv").config();
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
// Set the region
AWS.config.update({
    region: 'us-west-1'
});
// Create S3 service object
const s3 = new AWS.S3();
class AmazonAPI {
    static upload(filepath) {
        return __awaiter(this, void 0, void 0, function* () {
            // call S3 to retrieve upload file to specified bucket
            // const uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
            const uploadParams = {
                Bucket: process.env.BUCKET_NAME,
                Key: '',
                Body: '',
                contentType: ''
            };
            const file = filepath;
            // Configure the file stream and obtain the upload parameters
            const fileStream = fs.createReadStream(file);
            fileStream.on('error', function (err) {
                console.log('File Error', err);
            });
            uploadParams.Body = fileStream;
            uploadParams.Key = path.basename(file);
            uploadParams.contentType = 'image/jpeg';
            // call S3 to retrieve upload file to specified bucket
            //TODO: set content type to image/jpg
            yield s3.upload(uploadParams, function (err, data) {
                if (err) {
                    console.log("Error!!!!!!!!!!!!!!!!!", err);
                }
                if (data) {
                    console.log("Upload Success", data.Location);
                }
            });
            console.log("is this after?");
        });
    }
}
// const bucketParams = {
//   // Bucket : process.argv[2],
// };
// // Call S3 to obtain a list of the objects in the bucket
// s3.listObjects(bucketParams, function(err, data) {
//   if (err) {
//     console.log("Error", err);
//   } else {
//     console.log("Success", data);
//   }
// });
console.log("Ran!!!");
module.exports = AmazonAPI;
