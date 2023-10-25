"use strict";

const clientController=require("./clients.controller")

const express=require("express")
const router=express.Router()


router.post("/",(req,res)=>{
    if(req.role == "Administrator" || req.role=="Client"){
        clientController.create(req,res)
    }
    else{
        res.status(403).send({ message: "Forbidden Access" });

    }
})

router.get("/",(req,res)=>{
    if(req.role == "Administrator" || req.role=="Client"){
        clientController.getAllClients(req,res)
    }
    else{
        res.status(403).send({ message: "Forbidden Access" });

    }
})