import { PutObjectCommand, PutObjectCommandInput, S3Client } from '@aws-sdk/client-s3';
import { GetObjectCommand, GetObjectCommandInput } from '@aws-sdk/client-s3';
import { SQSEvent, S3Event, SQSHandler } from 'aws-lambda';
import jimp from 'jimp';
import path from 'path';

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

            // ファイルを取得
            const input:GetObjectCommandInput={
                Bucket:bucketName,
                Key:key,
            }
            const command = new GetObjectCommand(input);
            const {Body} = await s3Client.send(command);
            if(!Body){
                throw Error("ファイルが見つかりません");
            }
            const arrayBuffer = await Body.transformToByteArray();

            // 画像をリサイズ
            const bodyBuffer = Buffer.from(arrayBuffer);
            const image = await jimp.read(bodyBuffer);
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
            const putCommandInput:PutObjectCommandInput={
                Bucket:bucketName,
                Key:uploadKey,
                Body:imageBuffer,
            }
            const putCommand = new PutObjectCommand(putCommandInput);
            await s3Client.send(putCommand);      
        
        }

    }
}