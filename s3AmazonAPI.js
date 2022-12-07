"use strict";

require("dotenv").config();
const { v4 } = require("uuid");

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Set the region

// AWS.config.update({
//   region: 'us-west-1'
// });

// Create S3 service object
// const s3 = new AWS.S3();
const s3 = new S3Client({ region: 'us-west-1' });

class AmazonAPI {
  static async upload(file) {
    // call S3 to retrieve upload file to specified bucket
    // const uploadParams = {Bucket: process.argv[2], Key: '', Body: ''};
    const uploadParams = new PutObjectCommand({
      Bucket: process.env.BUCKET_NAME,
      Key: v4(),
      Body: file.buffer,
      ContentType: 'image/jpeg',
    });
    // const file = filepath;

    // const readableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
    //     frequency: 10,
    //     chunkSize: 2048
    // });

    // readableStreamBuffer.put(file);
    // console.log(readableStreamBuffer, "READABLE STREAM BUFFER!!!")

    // // Configure the file stream and obtain the upload parameters
    // const fileStream = fs.createReadStream(file);
    // fileStream.on('error', function(err) {
    //   console.log('File Error', err);
    // });
    // uploadParams.Body = fileStream;
    // uploadParams.Key = path.basename(filepath);
    // uploadParams.ContentType = file.mimetype;

    // call S3 to retrieve upload file to specified bucket
    //TODO: set content type to image/jpg
    // await s3.send(uploadParams, function (err, data) {
    //   if (err) {
    //     console.log("Error!!!!!!!!!!!!!!!!!", err);
    //   } if (data) {
    //     console.log("Upload Success", data.Location);
    //   }
    // });
    try {
        let data = await s3.send(uploadParams);
        console.log("THIS IS THE DATA!!!!!!!!", data);
    }
    catch(err) {
        console.log("API ERROR", err);
    }
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
