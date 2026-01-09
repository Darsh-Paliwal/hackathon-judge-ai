
import JSZip from 'jszip';

export interface PPTXData {
    text: string;
    images: {
        inlineData: {
            data: string;
            mimeType: string;
        }
    }[];
}

export async function extractDataFromPPTX(buffer: ArrayBuffer): Promise<PPTXData> {
    const zip = new JSZip();
    await zip.loadAsync(buffer);

    // 1. Extract Text
    const slides: string[] = [];
    const slideFiles = Object.keys(zip.files).filter(fileName =>
        fileName.match(/ppt\/slides\/slide\d+\.xml/)
    );

    slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)![1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)![1]);
        return numA - numB;
    });

    for (const fileName of slideFiles) {
        const fileData = await zip.files[fileName].async('string');
        const textMatches = fileData.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g);
        if (textMatches) {
            const slideText = textMatches
                .map(t => t.replace(/<[^>]+>/g, ''))
                .join(' ');
            slides.push(slideText);
        }
    }

    // 2. Extract Images (Limit to top representative images to avoid payload limits)
    // We look in ppt/media/
    const imageFiles = Object.keys(zip.files).filter(fileName =>
        fileName.match(/ppt\/media\/image.*\.(png|jpeg|jpg)/i)
    );

    // Sort to try and get them in order, though naming isn't always sequential by slide
    imageFiles.sort();

    // Take up to 10 images to avoid hitting token limits while giving enough context
    const selectedImages = imageFiles.slice(0, 10);
    const images: { inlineData: { data: string; mimeType: string } }[] = [];

    for (const imgPath of selectedImages) {
        const ext = imgPath.split('.').pop()?.toLowerCase();
        let mimeType = 'image/jpeg';
        if (ext === 'png') mimeType = 'image/png';
        if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';

        // Get base64
        const imgData = await zip.files[imgPath].async('base64');
        images.push({
            inlineData: {
                data: imgData,
                mimeType: mimeType
            }
        });
    }

    return {
        text: slides.join('\n\n'),
        images: images
    };
}
