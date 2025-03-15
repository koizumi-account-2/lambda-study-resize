import { GetObjectCommand, GetObjectCommandInput, PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import jimp from "jimp";

export const getImageFromS3 = async(bucketName:string,key:string,s3Client:S3Client)=>{
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
    const bodyBuffer = Buffer.from(arrayBuffer);
    const image = await jimp.read(bodyBuffer);
    return image;
}

export const putImageToS3 = async(bucketName:string,key:string,imageBuffer:Buffer,s3Client:S3Client)=>{
    const putCommandInput:PutObjectCommandInput={
        Bucket:bucketName,
        Key:key,
        Body:imageBuffer,
    }
    const putCommand = new PutObjectCommand(putCommandInput);
    await s3Client.send(putCommand);     
}