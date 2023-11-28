import passport from "passport";
import local from 'passport-local';
import github from 'passport-github2'
import { generateHash, separateName, validateHash } from "../utils.js";
import passportJWT from 'passport-jwt'
import config from "./config.js";
import userService from "../services/users.service.js";
import cartService from "../services/cart.service.js";

const findToken=(req)=>{
    let token = null;

    if(req.cookies.tokenCookie){
        token = req.cookies.tokenCookie
    }

    return token
}

export const initPassport = async ()=>{

    passport.use('jwt', new passportJWT.Strategy(
        {
            jwtFromRequest: passportJWT.ExtractJwt.fromExtractors([findToken]),
            secretOrKey: config.PRIVATE_KEY
        },
        (jwtContent, done)=>{
            try {
                done(null, jwtContent.user)
            } catch (error) {
                done(error)
            }
        }
    ))

    passport.use('register', new local.Strategy(
        {
            usernameField: 'email',
            passReqToCallback: true,
        },
        async (req, username, password, done)=>{
            try{

                let {name, last_name, role, email } = req.body;
                if(!name || !last_name || !role || !email || !password) return done(null, false, {message:'Complete the fields'});
                
                const userExists = await userService.getUserByEmail(email)

                if(userExists) return done(null, false, {message:`Existing user ${username}`})
                
                let createdCart = await cartService.createCart()

                const createdUser = await userService.createUser({
                    name: name,
                    last_name: last_name,
                    role: role,
                    email: email,
                    password: generateHash(password),
                    cart: createdCart._id
                })
    
                return done(null, createdUser);
            }catch (err){
                return done(err)
            }
        }
    ))

    passport.use('login', new local.Strategy(
        {
            usernameField: 'email',
        },
        async (username, password, done)=>{
            try{
                if(!username || !password) return done(null, false, {message:`Complete all fields`})

                const userExists = await userService.getUserByEmail(username);
                
                if(!userExists) return done(null, false, {message:`User ${username} not exists`});

                let equalPass = validateHash(password, userExists);
                if(!equalPass) return done(null, false, {message:`Password does not match`})

                let userResponse = {
                    name: userExists.name,
                    last_name: userExists.last_name,
                    role: userExists.role,
                    email:userExists.email,
                    _id: userExists._id,
                    cart: userExists.cart
                }

                return done(null, userResponse)

            }catch (err){
                return done(err)
            }
        }
    ))

    passport.use('github', new github.Strategy(
        {
            clientID: 'Iv1.902a664dcd6412e1',
            clientSecret: '01878264f9fc6ca75d04ea1e408534d5f805be5a',
            callbackURL: 'http://localhost:8080/api/sessions/githubCallback'
        },
        async(token, tokenRefresh, profile, done)=>{
            
            try {
                const existingUser = await userService.getUserByEmail(profile._json.email)
                if(existingUser){

                    let userResponse = {
                        name: existingUser.name,
                        last_name: existingUser.last_name,
                        role: existingUser.role,
                        email:existingUser.email,
                        _id: existingUser._id
                    }

                    return done(null, userResponse)
                }
                
                let { name, last_name } = separateName(profile._json.name);

                let createdCart = await cartService.createCart()
                
                const createUser = await userService.createUserWithGithub({
                    name: name,
                    last_name: last_name,
                    role: 'user',
                    email: profile._json.email,
                    cart: createdCart._id,
                    github: profile
                })

                done(null, createUser)
            } catch (err) {
                done(err)
            }
        }
    ))

    passport.serializeUser((user, done)=>{
        return done(null, user._id)
    })

    passport.deserializeUser(async (id, done)=>{
        const user = await userService.getUserById(id)
        return done(null, user)
    })
}