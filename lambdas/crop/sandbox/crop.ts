import jimp from "jimp"
import path from "path"

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

async function main(){
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);

    const width = image.getWidth();
    const height = image.getHeight();
    const cropWidth = Math.floor(width/2);
    image.crop(cropWidth,0,cropWidth,height);
    image.write('crop_images/crop_fuji.png');
}
main();