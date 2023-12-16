import { generateHash, generateJWT, validateHash } from "../utils.js";
import { send, transporter } from "../services/contact.service.js";
import config from "../config/config.js";
import userService from "../services/users.service.js";
import crypto from 'crypto'
import { isValidObjectId } from "mongoose";
import CustomError from "../services/errors/CustomError.js";
import { errorTypes } from "../services/errors/enums.js";
function redirectToLogin(req, res){
    try{
        return res.status(200).redirect(`/login?createdUser=${req.user.email}`)
    }catch(error){
        return res.status(500).redirect(`/?error=${error.message}`);
    }
}

async function generateLogin(req, res){
    try {
        let token = generateJWT(req.user)

        await res.cookie('tokenCookie', token, {
            maxAge: 1000*60*60,
            httpOnly:true
        })

        return res.status(200).redirect(`/profile`)
    }catch(error){
        return res.status(500).redirect(`/?error=${error.message}`);
    }
}

async function generateLogout(req,res){
    try{
        await res.clearCookie('coderCookie')
        await res.clearCookie('tokenCookie')
        return res.redirect('/login')
    }catch(error){
        return res.status(500).redirect(`/?error=${error.message}`);
    }
}

async function changeRole(req,res){
    try{
        const uid = req.params.uid;
console.log('first')
        if(!isValidObjectId(uid)){
            CustomError.createError({
                name:'Invalid user id',
                cause: 'The user id provided is incorrect',
                message: 'Error trying to find user',
                code: errorTypes.INVALID_ARGS_ERROR
            })
        }

        let user = await userService.getUserById(uid);
        
        if(user.role.toUpperCase() === "USER"){
            await userService.updateUser({_id: user._id}, { $set: { role: "PREMIUM" } });
            req.user.role = "PREMIUM"
        }else if(user.role.toUpperCase() === "PREMIUM"){
            await userService.updateUser({_id: user._id}, { $set: { role: "USER" } });
            req.user.role = "USER"
        }else{
            CustomError.createError({
                name:'Wrong user type',
                cause: 'You are not user or premium, please login',
                message: 'Error trying to find user',
                code: errorTypes.AUTHENTICATION_ERROR
            })
        }
        return res.status(200).redirect('/profile')
    }catch(error){
        return res.status(500).redirect(`/?error=${error.message}`);
    }
}

async function forgotPass(req,res){
    try{
        const userEmail = req.body.email;
        
        let existingUser = await userService.getUserByEmail(userEmail);
        if(!existingUser) return res.status(400).render('recoveryPassword', {error:'Email not found, please enter a valid email direction'})

        const timestamp = Date.now();
        const token = crypto.createHash('sha256').update(userEmail + timestamp).digest('hex').toString();

        const filter = { email: userEmail };
        const update = { $set: { token: {info:token, timestamp:timestamp} } };
        
        await userService.updateUser(filter, update);
        const resetLink = `http://localhost:3000/reset-password/${token}/${userEmail}`;
             
        await send(
            config.MAIL_USER,
            userEmail,
            'Recovery password',
            `Your recovery link is: ${resetLink}`
        ).catch(err=>console.log(err));

        return res.status(200).render('recoverySended', {email: userEmail});
    }catch(error){
        return res.status(500).redirect(`/?error=${error.message}`);
    }
}

async function changePassword(req,res, next){
    try{
        const { password, repeatedPassword } = req.body;
        const email = req.params.email
        let user = await userService.getUserByEmail(email);
        
        if(!password || !repeatedPassword) return res.status(400).redirect(`/reset-password/${user.token.info}/${user.email}?error=Please fill all fields`)
        if(password !== repeatedPassword) return res.status(400).redirect(`/reset-password/${user.token.info}/${user.email}?error=Passwords do not match`)
        
        let equalPass = validateHash(password, user);
        if(equalPass) return res.status(400).redirect(`/reset-password/${user.token.info}/${user.email}?error=The new password can't be equal to the previous`)
        let hashedPass = generateHash(password)
    
        const filter = { email: email };
        const update = { $set: { password: hashedPass, token:{info:"", timestamp:0} } };
        await userService.updateUser(filter, update);
        return res.status(200).render('login', {message:'Password changed successfuly'});
    }catch(error){
        next(error)
    }
}

export default {
    redirectToLogin,
    generateLogin,
    generateLogout,
    forgotPass,
    changePassword,
    changeRole
}