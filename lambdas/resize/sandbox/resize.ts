import jimp from "jimp"
import path from "path"

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

async function main(){
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);
    const width = image.getWidth();
    const height = image.getHeight();

    console.log(`変更前のsize: ${width} ,${height}`);
    const resizedWidth = Math.floor(width/2);
    const resizedHeight = Math.floor(height/2);
    console.log(`変更後のsize: ${resizedWidth} ,${resizedHeight}`);

    image.resize(resizedWidth,resizedHeight);
    image.write('resized_images/resized_fuji.png');
}
main();