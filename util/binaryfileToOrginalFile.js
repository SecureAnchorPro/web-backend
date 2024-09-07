const { Buffer } = require('buffer');

const binaryFileToOriginalFileUrl = (binaryData, mimeType) => {

    if(!binaryData){
        return null;
    }
    // Define MIME types for different file types
    // const mimeTypes = {
    //     'jpeg': 'image/jpeg',
    //     'jpg': 'image/jpeg',
    //     'png': 'image/png',
    //     'gif': 'image/gif',
    //     'pdf': 'application/pdf',
    //     'txt': 'text/plain',
    //     'html': 'text/html'
    // };

    // const mimeType = mimeTypes[fileType];
    // console.log(fileType)

    if (!mimeType) {
        console.error("Not be Empty");
        return;
    }

    // Ensure binaryData is a Buffer
    if (!(binaryData instanceof Buffer)) {
        console.error('Expected binaryData to be a Buffer, got:', typeof binaryData);
        return;
    }

    // Convert binary data to a base64 string
    const base64 = binaryData.toString('base64');

    // Create a data URL for the file
    const dataUrl = `data:${mimeType};base64,${base64}`;
    return dataUrl;
}

module.exports = binaryFileToOriginalFileUrl;
