import mongoose ,{Schema} from "mongoose";

const memberSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    role:{
        type:String,
        enum:["Viewer","Collaborator"],
        default:"Viewer"
    }
})


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
    members:[memberSchema]
},{timestamps:true})

export const Project = mongoose.model("Project",projectSchema)