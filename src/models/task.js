//mongoose = ODM(Object Data mapper)
const mongoose = require('mongoose');
const validator = require('validator');

const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    },
    completed:{
        type:Boolean,
        default:false
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})


taskSchema.pre('save',function (next){

    console.log("performing something before saving")

    next()
})

//remember to keep this in the end if performing any pre operations
const Tasks = mongoose.model('Tasks',taskSchema)
module.exports = Tasks