import { PutObjectCommand, PutObjectCommandInput, S3Client } from "@aws-sdk/client-s3";
import jimp from "jimp";
import path from "path";
import 'dotenv/config'

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");
const BUCKET_NAME = process.env.BUCKET_NAME;

// uplaodロジック
export const upload = async (imageBuffer:Buffer,bucketName:string,uploadPath:string)=>{
    const s3Client = new S3Client();
    const inout:PutObjectCommandInput={
        Bucket:bucketName,
        Key:uploadPath,
        Body:imageBuffer,
    }
    const command = new PutObjectCommand(inout);
    await s3Client.send(command);
}

// 呼び出しもと
async function main(){
    if(!BUCKET_NAME){
        throw Error("BUCKET_NAMEが空です");
    }
    const key = "fuji_from_ts.png";
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);
    const mime = image.getMIME();
    const imageBuffer = await image.getBufferAsync(mime);
    await upload(imageBuffer,BUCKET_NAME,`temp/${key}`);
}
main();