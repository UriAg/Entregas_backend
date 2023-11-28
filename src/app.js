import express from 'express';
import { __dirname, middLog } from './utils.js';
import path from 'path';
import ConnectMongo from 'connect-mongo'
import {Server} from 'socket.io';
import {engine} from 'express-handlebars';
import session from 'express-session';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import { initPassport } from './config/passport.config.js';
import config from './config/config.js';

import CustomSessionsRouter from './dao/MongoDb/routes/customSessions.router.js';
import CustomCartRouter from './dao/MongoDb/routes/customCart.router.js';
import CustomViewsRouter from './dao/MongoDb/routes/customViews.routes.js';
import CustomMessagesRouter from './dao/MongoDb/routes/customMessages.router.js';
import CustomProductsRouter from './dao/MongoDb/routes/customProducts.router.js';
import mongoose from 'mongoose';
import CustomContactRouter from './dao/MongoDb/routes/customContact.router.js';
import handleErrors from './middlewares/errors/handleErrors.js';


const app = express();

app.engine('handlebars', engine({allowProtoMethodsByDefault: true,}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname,'/views'));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(session({
  secret:config.PRIVATE_KEY,
  resave:true,
  saveUninitialized:true,
  store: ConnectMongo.create({
    mongoUrl:`${config.MONGO_URL}&dbName=${config.DB_NAME}`,
    ttl: 3600
  }),
  cookie:{
    maxAge:1000*3600
  }
}))
initPassport()
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(middLog)

const customSessions = new CustomSessionsRouter()
const customCart = new CustomCartRouter()
const customViews = new CustomViewsRouter()
const customProducts = new CustomProductsRouter()
const customMessages = new CustomMessagesRouter()
const customContact = new CustomContactRouter()

const auth = (req, res, next)=>{
  if(req.cookies.tokenCookie){
    next()
  }else{
    return res.redirect('/login')
  }
}

app.use('/api/products', auth, customProducts.getRouter());
app.use('/api/messages', auth, customMessages.getRouter());
app.use('/api/carts', auth, customCart.getRouter());
app.use('/api/sessions', customSessions.getRouter());
app.use('/api/contact', customContact.getRouter());
app.use('/', customViews.getRouter());
app.use(handleErrors)

const serverExpress=app.listen(config.PORT,()=>{
    console.log(`Server escuchando en puerto ${config.PORT}`);
});

const serverSocket=new Server(serverExpress)

serverSocket.on('connection',socket=>{
    console.log(`Se ha conectado un cliente con id ${socket.id}`)
})

export { serverSocket };