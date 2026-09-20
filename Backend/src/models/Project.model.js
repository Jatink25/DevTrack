import mongoose ,{Schema} from "mongoose";

const projectSchema = new Schema({
    name:{
        type: String,
        required:true,
        trim:true
    },
    description:{
        type: String,
        required:true
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true,
        
    },
    status:{
        type:String,
        enum:["Active","Archived","Completed"],
        default: "Active"
    },
    members:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    }]
},{timestamps:true})

export const Project = mongoose.model("Project",projectSchema)