import mongoose from "mongoose"
import bcrypt from "bcrypt"
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
        lowercase: true,
        trim: true
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


userSchema.pre("save",async function(){
    if(!this.isModified("password")) return;
    
    this.password = await bcrypt.hash(this.password,10)
});

export const User = mongoose.model("User",userSchema)