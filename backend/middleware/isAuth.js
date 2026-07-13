const jwt=require("jsonwebtoken") 
const isAuth = async(req,res,next)=>{
    try{
        let token=req.cookies.token
        if(!token && req.headers.authorization) {
            token = req.headers.authorization.split(" ")[1] || req.headers.authorization;
        }
        if(!token)
        {
            return res.status(400).json({message:'token not found'})
        }
        const verifyToken=await jwt.verify(token,process.env.JWT_SECRET)
       req.userId = verifyToken.userId;
        next()
    }
    catch(error)
        {
            console.log(error)
            return res.status(500).json({message:"is Auth erro"})
            
        }
}
module.exports=isAuth;