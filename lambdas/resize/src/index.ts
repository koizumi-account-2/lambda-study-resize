import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { SQSEvent, S3Event, SQSHandler } from 'aws-lambda';
import path from 'path';
import { getImageFromS3, putImageToS3 } from '../../common/src/index';

const DEIRECTORY = "resized";
const s3Client = new S3Client();
 
export const handler:SQSHandler = async (event:SQSEvent)=>{
    for(const record of event.Records){ 
        const s3Message:S3Event = JSON.parse(record.body);
        console.log("s3Message",JSON.stringify(s3Message, null, 2));
        for(const s3Event of s3Message.Records){
            const key = s3Event?.s3?.object?.key;
            const bucketName = s3Event?.s3?.bucket?.name;
            console.log(`${bucketName}に${key}がuploadされました。`);
            const image = await getImageFromS3(bucketName,key,s3Client);

            const width = image.getWidth();
            const height = image.getHeight();

            console.log(`変更前のsize: ${width} ,${height}`);
            const resizedWidth = Math.floor(width/2);
            const resizedHeight = Math.floor(height/2);
            console.log(`変更後のsize: ${resizedWidth} ,${resizedHeight}`);

            image.resize(resizedWidth,resizedHeight);

            // リサイズした画像をS3にアップロード
            const parsedKey = path.parse(key);
            const uploadKey = `${DEIRECTORY}/${parsedKey.name}-resize${parsedKey.ext}`;
            const imageBuffer = await image.getBufferAsync(image.getMIME());
            console.log(`uploadKey:${uploadKey}, bucket:${bucketName}`);
            await putImageToS3(bucketName,uploadKey,imageBuffer,s3Client);
        }

    }
}