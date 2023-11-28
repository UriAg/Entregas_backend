import { Router } from "express";
import jwt from "jsonwebtoken";
import config from "../../../../config/config.js";
// import { PRIVATE_KEY } from "../../../../utils.js";

export class MyRouter{
    constructor(){
        this.router=Router()
        this.init()
    }

    init(){}

    getRouter(){
        return this.router
    }

    get(path, permissions, ...functions ){
        this.router.get(path, this.myResponses, this.access(permissions), functions)
    }

    post(path, permissions, ...functions ){
        this.router.post(path, this.myResponses, this.access(permissions), functions)
    }

    put(path, permissions, ...functions ){
        this.router.put(path, this.myResponses, this.access(permissions), functions)
    }

    delete(path, permissions, ...functions ){
        this.router.delete(path, this.myResponses, this.access(permissions), functions)
    }

    myResponses=(req, res, next)=>{
        res.success=response=>res.status(200).json({status:'success', response})
        res.clientError=error=>res.status(400).json({status:'Client error', error})
        res.authenticationError=error=>res.status(401).json({status:'Authentication error', error})
        res.authorizationError=error=>res.status(403).json({status:'Authorization error', error})
        
        next()
    }
    access(permissions=['PUBLIC']){
        return (req, res, next)=>{
            if(permissions.includes('PUBLIC')) return next()
            
            if(!req.cookies.tokenCookie) return res.authenticationError('Token not found')
            let token = req.cookies.tokenCookie
            
            jwt.verify(token, config.PRIVATE_KEY, (err, credentials)=>{
                if(err){
                    return res.authenticationError('Login!')
                }else{
                    if(permissions.includes(credentials.user.role.toUpperCase())) return next()
                    else return res.authorizationError('Unauthorized')
                }
            })
        }
    }
}