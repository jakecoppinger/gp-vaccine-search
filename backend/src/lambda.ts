import * as awsServerlessExpress from 'aws-serverless-express';
import app from './app';
var server = awsServerlessExpress.createServer(app);


module.exports.handler = (event: any, context:any) => 
    awsServerlessExpress.proxy(server, event, context)