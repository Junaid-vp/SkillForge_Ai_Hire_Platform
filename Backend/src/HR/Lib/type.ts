// Extend Express Request interface to include userId

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

// JwtPayload

export interface JwtPayload {
  Email: string;
  Id: string;
}

// HrDetails

export  interface HrDetails {

  name: string;
  email: string;
  companyName: string;
  designation: string;
  companyWebsite: string;
  password: string;
  otp?:string;
  otpExpiry?:any

}



// Developer Details
export interface DeveloperDetails {
  hrId:         string;
  developerName:  string;
  developerEmail: string;
  position:       string;
  experience:     string;
  interviewDate:  string;
  interviewTime:  string;
  uniqueCode:     string;
  resumeUrl:      string | null;
  aiSummary:      string | null;
  skills:         string[] | null;
}


export interface TaskLibary{
   title:string
   description:string
   requirements:string[]
   category:string
   techStack:string
   difficulty:string
   duration:number
}