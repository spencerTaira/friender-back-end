import aws from 'aws-sdk';

require("dotenv").config();

const region = "us-west-1";
const bucket = process.env.BUCKET_NAME;
const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
