import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";


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