const express = require('express')
const Task = require('../models/task')
const router = new express.Router()
const auth = require('../middleware/auth')



router.post('/tasks',auth, async (req,res) => {
    console.log(req.body)
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        author:req.user._id
    })

    try{
        await task.save()
        res.status(201).send(task)
    }
    catch(err){
        res.status(400).send(err)
    }

    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((err) => {
    //     res.status(400).send(err)
    // })
})

//------------------------------------------------------

//GET /tasks?completed=true
//GET /tasks?limit=10&skip=0
//GET /tasks?sortBy=createdAt:asc or :desc
router.get('/tasks',auth,async (req,res) => {
 
    const match = {}

    if(req.query.completed){
        match.completed = req.query.completed === 'true'
    }

    try{
        
        await req.user.populate({
            path:'userTasks',
            match,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort:{
                    createdAt:1   //1 is ascending, -1 is descending
                }
            }
        }).execPopulate()
        // const tasks  = await Task.find({author: req.user._id})
        // res.send(tasks)
        res.send(req.user.userTasks)
    }
    catch(err){
        res.status(500).send(err)
    }
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((err) => {
    //     res.status(500).send(err)
    // })
})

router.get('/tasks/:id',auth,async (req,res) => {
    const _id = req.params.id

    try{
        
        const task = await Task.findOne({_id,author:req.user._id}) 

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    }
    catch(err){
        res.status(500).send(err)
    }
    // Task.findById(_id).then((task) => {
    //     if(!task){
    //         return res.status(404).send()
    //     }

    //     res.send(task)
    // }).catch((err) => {
    //     res.status(500).send(err)
    // })
})

//------------------------------------------------
    


router.patch('/tasks/:id', auth,async (req,res) => {
    const _id = req.params.id
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description','completed']
    try{

        const isValidOperation = updates.every((update) => {
            return allowedUpdates.includes(update)
        })

        if(!isValidOperation){
            res.status(400).send({error:"invalid operation"})
        }
        const task = await Task.findOne({_id,author:req.user._id})

        if(!task){
            res.status(404).send()
        }

        updates.forEach( (update) => { task[update] = req.body[update] })

        // const task = await Task.findByIdAndUpdate(_id,req.body,{runValidators:true,new:true})

        await task.save()

       
        res.send(task)
    }
    catch(err){
        res.status(500).send()
    }

})

//-------------------------------------------------

router.delete('/tasks/:id',auth,async (req,res) => {
    const _id = req.params.id

    try{
        const task = await Task.findOne({_id,author:req.user._id})

        if(!task){
            return res.status(404).send()
        }
        res.send(task)
       await task.remove()
        
    }
    catch(err){
        res.status(500).send()
    }
})

module.exports = router