import { S3Client, GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";
import 'dotenv/config'

const BUCKET_NAME = process.env.BUCKET_NAME;

export const download = async (bucketName:string,key:string)=>{
    const s3Client = new S3Client();
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
    console.log(arrayBuffer);
}

async function main(){
    if(!BUCKET_NAME){   
        throw Error("BUCKET_NAMEが空です");
    }
    const key = "original/fuji.png";
    await download(BUCKET_NAME,key);
}
main();