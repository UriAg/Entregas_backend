import { generateJWT } from "../utils.js";

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
    }catch{
        return res.status(500).redirect(`/?error=${error.message}`);
    }
}

export default { redirectToLogin, generateLogin, generateLogout }