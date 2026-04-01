import { v2 as cloudinary } from 'cloudinary';
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
export const uploadFile = async (buffer, fileName) => {
    return new Promise((resolve, reject) => {
        const uploadstream = cloudinary.uploader.upload_stream({
            resource_type: "image",
            folder: "skillforge/resumes",
            public_id: fileName,
            format: "pdf"
        }, (error, result) => {
            if (error)
                reject(error);
            else
                resolve(result.secure_url);
        });
        uploadstream.end(buffer);
    });
};
