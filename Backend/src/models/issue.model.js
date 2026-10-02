import mongoose from "mongoose";

const issueSchema = new mongoose.Schema({
    title:{
        type: String,
        required:true,
    },
    description:{
        type:String,
        required: true,
    },
    project:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Project",
        required:true
    },
    createdBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    assignedTo:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    status:{
        type:String,
        enum:["Todo","In Progress","Review","Completed"],
        default:"Todo"
    },
    priority:{
        type:String,
        enum:["Low","High","Medium","Critical"],
        default:"Medium"
    },
    attachments:[{
        url:{
            type:String
        },
        publicId:{
            type:String
        }
    }],
    dueDate:{
        type:Date
    }
    
},{timestamps:true})

export const Issue = mongoose.model("Issue",issueSchema)