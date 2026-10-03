import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content:{
        type:String,
        required: true
    },
    issue:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Issue",
        required:true
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    }    
},{timestamps:true})

export const Comment = mongoose.model("Comment",commentSchema)