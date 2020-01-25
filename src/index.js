const express = require('express');
require('./db/mongoose')  //just run the mongoose file, and connect to mongodb
// const User = require("./models/user")
// const Task = require("./models/task")
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express();

const port = process.env.PORT 


const multer = require('multer')

const upload = multer({
    dest:'images',
    limits:{
        fileSize:1000000,        //1MB 
    },
    fileFilter(req,file,cb) {   //cb:callback

        if(!file.originalname.match(/\.(doc|docx)$/)){
            return cb(new Error('File must be a word doc'))
        }

        cb(undefined,true)
        // cb(new Error('File must be a pdf'))   //upload failed
        // cb(undefined, true)                     //upload successfull
    }
})

//if you use this middleware instead of upload.single(), you will get an error html page
const errorMiddleware = (req,res,next) => {
    throw new Error('From my middleware')
}


//the value provided in the upload parameter needs to match the key 
//for the binary form data you are uploading(you are telling multer
//to look for a file called upload in the incoming request)
app.post('/upload',upload.single('upload'),(req,res) => { 
    res.send()   
    
//function that runs if something fails (4 parameters must be specified)                               
},(err,req,res,next) => {  
    res.status(400).send({ error:err.message})
})                                                        

 //With middleware : new request -> do something -> run route handler
// app.use((req,res,next) => {
//     if(req.method === 'GET' ){
//         res.status(400).send('GET requests are disabled')
//     }
//     else{
//         next()
//     }
    
// })

// app.use((req,res,next) => {
//     res.status(503).send('<h1>Site is currently in mainteinance mode</h1>')
// })



//will automatically parse incoming json to an object, so we can access it in our request handlers.
app.use(express.json())   
app.use(userRouter)
app.use(taskRouter)


app.listen(port,() => {
    console.log(`Server is up and running on port ${port}`);
})


const User = require('./models/user')
const Task = require('./models/task')

const main = async () => {
    //Demo of how populate works....
    // const task = await Task.findById('5e0e155d6a85771b3681c5f0')
    // await task.populate('author').execPopulate()
    // console.log(task.author)

    // const user = await User.findById('5e0e0497b7dfc9189cab7916')
    // await user.populate('userTasks').execPopulate()
    // console.log(user.userTasks)

}

main()