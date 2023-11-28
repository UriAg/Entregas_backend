// import mongoose from 'mongoose'
// import config from '../../config/config.js'
import messageModel from './models/messages.model.js'

class MongoDaoMessages{
    constructor(){

    }

    async get(filter={}){
        return await messageModel.find(filter).lean();
    }

    async create(user, message){
        return await messageModel.create({
            user,
            message
        });
    }

    async deleteAll(){
        return await messageModel.deleteMany({})
    }

}

export default MongoDaoMessages;