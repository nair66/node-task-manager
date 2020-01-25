//mongoose = ODM(Object Data mapper)
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task= require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0){
                throw new Error('Age must a positive number')
            }
        }
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Improper email format')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(value){
            if(validator.contains(value.toLowerCase(),"password")){
                throw new Error('Your password cannot contain the word password')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
},)

//methods are available on the instances, also known as instance methods
userSchema.methods.generateAuthToken = async function (){
    const user = this
    const token = jwt.sign({_id:user._id.toString() } ,process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.virtual('userTasks',{ 
    ref:'Tasks',
    localField:'_id',
    foreignField:'author'
})

// userSchema.methods.getPublicProfile = function() {
//     const user = this

//     const userObject = user.toObject() // mongoose function to convert to a bare object without any special mongoose properties

//     delete userObject.password
//     delete userObject.tokens

//     console.log(userObject)

//     return userObject
// }


//toJSON is called whenever the object gets stringified. (this happens when u call res.send()), hence you are able to directly modify the object and send it as above.
userSchema.methods.toJSON = function() {
    const user = this

    const userObject = user.toObject() // mongoose function to convert to a bare object without any special mongoose properties

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    console.log(userObject)

    return userObject
}

//static methods are available on the model, also know as odel methods
userSchema.statics.findByCredentials = async (email,password) => {
    const user = await User.findOne({ email })

    if(!user){
        throw new Error('Unable to log in')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch){
        throw new Error('Unable to log in')
    }

    return user
}

//Hash the plain text password before saving
userSchema.pre('save', async function(next) {
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }

    next()
})


userSchema.pre('remove',async function(next) {
    const user = this

   await Task.deleteMany({author : user._id}) 
    
    next()
})
const User = mongoose.model('User',userSchema)

module.exports = User