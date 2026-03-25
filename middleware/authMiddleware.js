const jwt = require("jsonwebtoken")
const authMiddleware=(req,res,next)=>{
  const authHeader = req.headers.authorization;
  if(!authHeader || !authHeader.startsWith("Bearer ")){
    return res.status(401).json({message:"Access denied. Token is required!!!",success:false})
  }
  const token = authHeader.split(" ")[1];
  try {
    const decodedUser =jwt.verify(token,process.env.JWT_KEY);
    req.user = decodedUser;
    next();
  } catch (error) {
    res.status(401).json({message:"Token is not valid",success:false})
  }
}
module.exports = authMiddleware
