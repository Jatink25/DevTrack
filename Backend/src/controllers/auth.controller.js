import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


const generateAccessAndRefreshToken = async (userId)=>{
    try{
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken,refreshToken}
    }
    catch(error){
        throw new ApiError(400,"something went wrong while generating tokens")
    }
}

const registerUser = asyncHandler(async (req,res)=>{
    const {username,email,password} = req.body

    if(!(username && email && password)){
        throw new ApiError(400,"All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"user already exists")
    }

    const user =await User.create({
        username,
        email,
        password
    });

    const createdUser = await User.findById(user._id).select("-password");

    if(!createdUser){
        throw new ApiError(500,"something wrong while registering user")
    }

    return res.status(201).json(
        new ApiResponse(201,createdUser,"User registered successfully!")
    )
});

const loginUser = asyncHandler(async (req,res)=>{
    const {email,password} = req.body

    if(!(email&&password)){
        throw new ApiError(400,"all fields are required")
    }
    const user = await User.findOne({email})

    if(!user){
        throw new ApiError(404,"User not found")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(400,"Invalid Credentials")
    }


    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    //sending cookies

    const options={
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(200,loggedInUser,"user logged in successfully")
    )
})

export {registerUser, loginUser}