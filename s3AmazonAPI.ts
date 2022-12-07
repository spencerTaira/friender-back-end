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
  static async upload(filepath) {
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
    fileStream.on('error', function(err) {
      console.log('File Error', err);
    });
    uploadParams.Body = fileStream;
    uploadParams.Key = path.basename(file);
    uploadParams.contentType = 'image/jpeg';
    
    // call S3 to retrieve upload file to specified bucket
    //TODO: set content type to image/jpg
    await s3.upload (uploadParams, function (err, data) {
      if (err) {
        console.log("Error!!!!!!!!!!!!!!!!!", err);
      } if (data) {
        console.log("Upload Success", data.Location);
      }
    });
    console.log("is this after?");
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