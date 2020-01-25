const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const {sendWelcomeEmail,sendCancellationEmail} = require('../emails/account')
const router = new express.Router()


const upload = multer({
    limits:{
        fileSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('File extension must be png,jpg or jpeg'))
        }

        cb(undefined,true)
    }
})

// router.get('/test',(req,res) => {
//     res.send('from a new file')
// })

//since this is a post request, you have to take the info from the header body, and not params. The client will have to attach it in the header and send to this server.

router.post('/users', async (req,res) => {
    console.log(req.body)                       //access the json data
    const user = new User(req.body)

    //NEW VERSION
    try{
        await user.save()
        sendWelcomeEmail(user.email,user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({user,token})
    } catch(err){
        res.status(400).send(err)
    }


    //OLDER VERSION
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((err) => {
    //     //this status code is sent because something went wrong
    //     res.status(400).send(err)
    // })

});

router.post('/users/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateAuthToken()

        res.send({user,token})
    }
    catch(e){
        res.status(400).send()
    }
})

router.post('/users/logout',auth,async(req,res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.status(200).send()
    }
    catch(err){
        res.statue(500).send()
    }
})

router.post('/users/logoutAll',auth,async (req,res) => {
    try{
        req.user.tokens = []

       await req.user.save()

       res.status(200).send()
    }
    catch(err){
        res.status(500).send(err)
        console.log(err)
    }
})

//run auth middleware first, before running the route handler(provided the middleware calls next())
router.get('/users/me',auth, async (req,res) => {
   
   res.send(req.user)
   
    //NEW VERSION
    // try{
    //     const users = await User.find({})
    //     res.send(users)
    // }
    // catch(err){
    //     res.status(500).send()
    // }
    
    //OLD VERSION
    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((err) => {
    //     res.status(500).send()
    // })
})

//capture the dynamic value that is sent, using the name id

// (Not Needed anymore)
// router.get('/users/:id',async (req,res) => {
//     const _id = req.params.id             //similiar to req.query

//     try{
//         const user = await User.findById(_id)

//         if(!user){
//             return res.send.status(404).send()
//         }
//         res.send(user)
//     }
//     catch(err){
//         res.status(500).send(err)
//     }

    //OLD VERSION
    // User.findById(_id).then((user) => {   //mongoose automatically converts string ids to ObjectID
    //     if(!user){
    //         return res.status(404).send()
    //     }

    //     res.send(user)
    // }).catch((err) => {
    //     res.status(500).send(err)
    // })
// });

router.patch('/users/me',auth,async (req,res) => {

    const updates = Object.keys(req.body)

    const allowedUpdates = ['name','age','email','password']

    const isValidOperation = updates.every((update) =>{
        return allowedUpdates.includes(update)
    })

    if(!isValidOperation){
        res.status(400).send({error : 'Invalid updates'})
    }
    _id = req.params.id
    try{

        const user = await req.user

        updates.forEach((update) => {
            user[update] = req.body[update]
        })

        await user.save()

        // const user = await User.findByIdAndUpdate(_id,req.body,{new:true,runValidators:true}) //return new user after update,and run the existing validators

        // if(!user){
        //     return res.status(404).send()
        // }

        res.send(user)
    }
    catch(err){
        res.status(400).send()
    }
})

router.delete('/users/me',auth, async (req,res) => {
    const _id = req.user._id

    try{
        //Deprecated
        // const user = await User.findByIdAndDelete(_id)

        // if(!user){
        //     return res.status(404).send()
        // }

        await req.user.remove()
        sendCancellationEmail(req.user.email,req.user.name)
        res.send(req.user)
    }
    catch(err){
        res.status(500).send()
    }

})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req,res) => {
    const buffer = await sharp(req.file.buffer).resize(250,250).png().toBuffer()


    req.user.avatar = buffer
    
    //following is only accessible if dest option is not specified
    // req.user.avatar = req.file.buffer
    await req.user.save()

    res.status('200').send()
},(err,req,res,next)=>{
    res.status(400).send({ error: err.message})
})



router.delete('/users/me/avatar',auth, async (req,res) => {
    req.user.avatar = undefined
    await req.user.save()

    res.status('200').send()
},(err,req,res,next)=>{
    res.status(400).send({ error: err.message})
})

router.get('/users/:id/avatar',async (req,res) => {
    try{
        const user = await User.findById(req.params.id)

        if(!user || !user.avatar){
            throw new Error()
        }

        //setup response headers
        res.set('Content-Type','image/png')
        res.send(user.avatar)
    }
    catch(err){
        res.status(404).send()
    }
})

module.exports = router

// //create a new router
// const router = new express.Router()

// //set up routes
// router.get('/test',(req,res) => {
//     res.send("This is from the router")
// })

// // register the router 
// app.use(router) 