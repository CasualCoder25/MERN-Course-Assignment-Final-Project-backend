const express = require("express")
const routes = express.Router()
const mongoose=require("mongoose");
const userSchema = require("../models/UserSchema");
const tasksSchema=require("../models/TasksSchema");
const {createUserToken,validateUserToken}=require("../auth/auth");
const bcrypt=require('bcrypt');
const {deleteTimeoutEmail,emailService}=require("../services/emailService");
const getTimeout = require("../services/getTimeout");

// Create Routes Here

//SIGNUP
routes.post("/signup",(req,res)=>{
    const {name,email,password}=req.body;
    bcrypt.hash(password,10).then((hash)=>{
        userSchema.create({
            name:name,
            email:email,
            password:hash
        }).then(()=>{
            res.json("Registered successfully");
        }).catch((err)=>res.json({error:err}))
    })
});

//LOGIN
routes.post("/login", async (req,res)=>{
    const {name,email,password}=req.body;
    const user=await userSchema.findOne({where:{email:email}});

    if(!user) res.json({error:"User does not exist"});
    const pswd=user.password
    bcrypt.compare(password,pswd).then((match)=>{
        if(!match){
            res.json({error:"Invalid credentials"})
        }
        else{
            const accessToken=createUserToken(user)
            res.cookie("access-token",accessToken,{
                maxAge:60*60*24*1000
            })
            res.json("LOGIN SUCCESSFUL")
        }
    })
})

//PROFILE- FETCH CURRENT TASKS
routes.get("/profile",validateUserToken,(req,res)=>{
        tasksSchema.find({user_email_id:req.body.email_id},{completed:false},(err,data)=>{
            if(err)
            return err;
            else
            res.json(data);
        })
    })

//FETCH COMPLETED TASKS
routes.get("/completed",(req,res)=>{
    tasksSchema.find({user_email_id:req.body.email_id},{completed:true},(err,data)=>{
        if(err)
        return err;
        else
        res.json(data);
    })
})

//CREATE A NEW TASK AND EMAIL REMINDER
routes.post("/create-task",(req,res)=>{
    // const {id,email_id,task_name,star,reminder_time}=req.body;
    const subj=`Reminder for task ${req.body.task_name}`
    const text=`Your task ${req.body.task_name} is due at ${req.body.reminder_time}.`
    tasksSchema.create(req.body,(err,data)=>{
                if(err)
                return err;
                else
                res.json(data);
    })
    .then(()=>{
        res.json("Task created successfully");
        const timeout=getTimeout(req.body.reminder_time);
        emailService("todolistmail23@gmail.com",req.body.email_id,subj,text,req.body._id,timeout);
    })
    .catch((err)=>res.json({error:err}))

    });


 //EDIT TASK, DELETE AND RESET REMINDER(optimize pls)
routes.route("/edit-task/:id")
.get((req,res)=>{
    tasksSchema.findById(mongoose.Types.ObjectId(req.params.id),(err,data)=>{
        if(err)
        res.json(err);
        else
        res.json(data);
    })
})
.put((req,res)=>{
    tasksSchema.findByIdAndUpdate(mongoose.Types.ObjectId(req.params.id),{$set:req.body},(err,data)=>{
        if(err)
        return err;
        else
        res.json(data);
    })
    //debug!!
    deleteTimeoutEmail(email,req.params.id);   
    const timeout=getTimeout(req.body.reminder_time);
    emailService("todolistmail23@gmail.com",req.body.email_id,subj,text,req.params.id,timeout);
    res.json("Task edited successfully");

});

//DELETE TASKS
routes.delete("/delete-task/:id",(req,res)=>{
    deleteTimeoutEmail(email,req.body.email);
    tasksSchema.findByIdAndRemove(mongoose.Types.ObjectId(req.params.id),(err,data)=>{
        if(err)
        return err;
        else
        res.json(data);
    })
})




module.exports = routes