import { Request, Response } from "express"
import { parseResume } from "../services/resumeParser.js"
import { randomBytes } from "crypto"
import { uploadFile } from "../services/cloudinary.js"


export const parseResumeController = async(req:Request,res:Response)=>{
    try{
  const id = req.userId

    if (!id) {
      return res.status(401).json({ Message: "HR not logged in" })
    }

    if (!req.file) {
      return res.status(400).json({ Message: "Please upload a PDF" })
    }

     if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ Message: "Only PDF files allowed" })
    }

    if (req.file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ Message: "File size must be under 5MB" })
    }

    const data = await parseResume(req.file.buffer);

    const resumeName = `resume_${randomBytes(8).toString("hex")}`;

    const resumeUrl = await uploadFile(req.file.buffer,resumeName);
   
    res.status(200).json({
        data:{
            ...data,
            resumeUrl
        },
        Status:"Success"
    })


    }catch(e:any){
        res.json({
            Message:"Server Error",
            Error:e.message
        })
    }
}