import {v2  as cloudinary} from 'cloudinary'
import dotenv from 'dotenv'



cloudinary.config({
cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadFile  = async(buffer:Buffer,fileName:string): Promise<string> => { 
return new Promise((resolve,reject)=>{
    const uploadstream = cloudinary.uploader.upload_stream(
        {
            resource_type:"image",
            folder:"skillforge/resumes",
            public_id:fileName,
            format:"pdf"
        },
        (error,result)=>{
            if(error)reject(error)
            else resolve(result!.secure_url)
        }
    )
    uploadstream.end(buffer)
})
}



export const uploadZip = async (filePath: string, id: string): Promise<string> => {
  const result = await cloudinary.uploader.upload_large(filePath, {
    resource_type: "raw",
    folder: "skillforge/submissions",
    public_id: `task_${id}_${Date.now()}`,
    format: "zip",
    chunk_size: 6_000_000, // 6MB chunks
  }) as { secure_url: string }
  return result.secure_url
}
