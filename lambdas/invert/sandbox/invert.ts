import jimp from "jimp"
import path from "path"

const REPOSITORY_TOP = path.resolve(__dirname,"../../../");

async function main(){
    const imagePath = path.join(REPOSITORY_TOP,"images/fuji.png");
    console.log(`reading an image form ${imagePath}`);
    const image = await jimp.read(imagePath);
    image.invert();
    image.write('invert_images/invert_fuji.png');
}
main();