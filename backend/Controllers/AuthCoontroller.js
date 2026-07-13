const User = require("../Models/user.models")
const bcrypt=require("bcryptjs")
const gentoken=require("../Config/token.js")

exports.signUp = async (req,res)=>{
    try{
        const {name,email,password}=req.body
        const existEmail=await User.findOne({email})

        if(existEmail)
        {
            return res.status(400).json({message:"email already exist!!!"})
        }
        if(password.length<8)
        {
                   return res.status(400).json({message:"Password must be atleast 8 characters"})
        }
        const hashedPassword=await bcrypt.hash(password,10)

        const user=await User.create({
            name,
            password:hashedPassword,
            email
        })

        const token=await gentoken(user._id)

        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:'None',
            secure:true
        })
        const userObj = user.toObject();
        userObj.token = token;
        return res.status(201).json(userObj)


    }
    catch(error)
    {
            return res.status(500).json({message:`sign up error ${error}`})
    }
}

exports. Login = async (req,res)=>{
    try{
        const {email,password}=req.body

        const user=await User.findOne({email})

        if(!user)
        {
            return res.status(400).json({message:"USER doesnot exist!!!"})
        }

        const ismatch=await bcrypt.compare(password,user.password)
        if(!ismatch)
        {
                   return res.status(400).json({message:"invalid Password"})
        }


    

        const token = await gentoken(user._id);


        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:'None',
            secure:true
        })
        const userObj = user.toObject();
        userObj.token = token;
        return res.status(200).json(userObj)


    }
    catch(error)
    {
            return res.status(500).json({message:`login  error ${error}`})
    }
}

exports.logout =async (req,res) =>{
    try{
         res.clearCookie("token", { httpOnly: true, sameSite: 'None', secure: true })
         return res.status(200).json({message:"Logout Successfully"})
    }
    catch(error)

    {

         return res.status(500).json({message:`logout  error ${error}`})

    }
}
