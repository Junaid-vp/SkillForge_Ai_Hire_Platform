import rateLimit   from "express-rate-limit"




// Strict limiter for auth routes (prevent brute force)
export const authLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              10,              // only 10 login attempts
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    Message: "Too many login attempts. Please try again after 15 minutes.",
    status:  "error"
  }
})

// AI routes limiter (expensive operations)
export const aiLimiter = rateLimit({
  windowMs:         60 * 60 * 1000, // 1 hour
  max:              20,              // 20 AI calls per hour
  standardHeaders:  true,
  legacyHeaders:    false,
  message: {
    Message: "AI request limit reached. Please try again in 1 hour.",
    status:  "error"
  }
})




export const reportLimiter = rateLimit({
  windowMs:        60 * 60 * 1000,  // 1 hour
  max:             10,               // 10 emails per hour per IP
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    Message: "Email limit reached. Please try again in 1 hour.",
    status:  "error"
  }
})
 