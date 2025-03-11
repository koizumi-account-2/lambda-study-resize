import {S3Event, S3Handler} from 'aws-lambda'
 
 export const handler:S3Handler = (event:S3Event)=>{
     console.log("呼ばれました");
     console.log('%o',event)
 }