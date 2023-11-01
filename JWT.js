const {sign,verify}=require("jsonwebtoken");
const createTokens=(user)=>{
    const accessToken=sign({id:user.id,email:user.email},"voldemort");
    return accessToken;
}

const validateToken=(req,res,next)=>{
    const accessToken=req.cookies["access-token"]
    if(!accessToken) return res.json({error:"Not authenticated, please login"})
    try{
    const validToken=verify(accessToken,"voldemort")
    if(validToken){
        req.authenticated=true
        return next()
    }
    }catch(err){
        return res.json({error:err})
    }
}

module.exports={createTokens,validateToken};