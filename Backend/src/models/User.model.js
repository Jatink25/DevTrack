import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum:["Admin","Owner","Collaborator","Viewer"],
        default:"Viewer"
    },
    avatar:{
        type: String
    },
},{timestamps:true});

export const User = mongoose.model("User",userSchema)