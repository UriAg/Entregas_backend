import {fileURLToPath} from 'url';
import { dirname } from 'path';
import bcrypt from 'bcrypt';
import nlp from 'compromise/three';
import jwt from 'jsonwebtoken'
import passport from 'passport';
import config from './config/config.js';
import { faker } from '@faker-js/faker'
import winston from 'winston';

const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

export const generateHash = password => bcrypt.hashSync(password, bcrypt.genSaltSync(10));
export const validateHash = (password, user) => bcrypt.compareSync(password, user.password);

export const separateName = completeName => {
    const doc = nlp(completeName);
    let name = '';
    let last_name = '';

    doc.terms().forEach((term) => {
         if (term.match('#Noun')) {
            if (!name) {
                name = term.out('text');
            } else {
                last_name += term.out('text') + ' ';
            }
        }
    });

    return {
        name: name,
        last_name: last_name,
    };
}

// import { config } from './config/config.js';
// export const PRIVATE_KEY = config.PRIVATE_KEY;
// export const PRIVATE_KEY = 'secretPass';

export const generateJWT=(user)=>jwt.sign({user}, config.PRIVATE_KEY, {expiresIn: '1h'})

export const validateJWT=(req, res, next)=>{
    if(!req.cookies.tokenCookie) return res.status(400).json({error:'No existe el token'})

    let token = req.cookies.tokenCookie

    jwt.verify(token, config.PRIVATE_KEY, (error, credentials)=>{
        if(error) return res.status(401).json({error:'Token invalido'})
        req.user = credentials.user

        next()
    })
}

export const passportCall=(strategy, failureRedirection)=>{
    return async function(req, res, next){
        passport.authenticate(strategy, function(err, user, info, status){
            if(err) return next(err);
            if(!user){
                return res.status(status).redirect(failureRedirection+`?error=${info.message ? info.message : info.toString()}`);
            }
            req.user=user
            return next()
        })(req, res, next)
    }
}

export const generateProducts = () =>{
    return {
        title: faker.commerce.product(),
        description: faker.commerce.productDescription(),
        price: faker.commerce.price({min:250, max:1000}),
        code: faker.string.alphanumeric({casing:"upper", length:{min:5, max:10}}),
        thumbnail: "",
        status: true,
        stock: faker.number.int({min:1, max:20}),
        category: faker.commerce.productAdjective()
    }
}

const customLoggerLevels = {
    importanceLevels:{fatal:0, error:1, warning:2, info:3, http:4, debug:5},
}

const devLogger = winston.createLogger({
    level: 'debug',
    levels: customLoggerLevels.importanceLevels,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.simple()
            )
        })
    ]
})

const prodLogger = winston.createLogger({
    level:'info',
    levels: customLoggerLevels.importanceLevels,
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        new winston.transports.File({
            filename:'./errors.log',
            level:'error',
            levels:customLoggerLevels.importanceLevels,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
})

if(config.ENVIRONMENT !== 'develop'){
    devLogger.add(prodLogger);
}

export const middLog = (req, res, next)=>{
    req.logger=devLogger
    next()
}