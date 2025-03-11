import {S3Event, S3Handler} from 'aws-lambda'
 
export const handler:S3Handler = (event:S3Event)=>{
    let fileName = '';
    let bucketName = '';
    for(const record of event.Records){ 
        fileName = record?.s3?.object?.key;
        bucketName = record?.s3?.bucket?.name;
        console.log(fileName,bucketName,`${bucketName}に${fileName}がuploadされました。`);
    }
}