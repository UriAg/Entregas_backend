// import mongoose from 'mongoose'
// import config from '../../config/config.js'
import cartModel from './models/cart.model.js'

class MongoDaoCarts{
    constructor(){

    }

    async get(filter){
        return await cartModel.find(filter).lean();
    }

    async getOne(filter){
        return await cartModel.findOne(filter).lean();
    }

    async create(){
        return await cartModel.create({products:[]});
    }

    async updateOne(filter, update){
        return await cartModel.updateOne(filter, update);
    }

    async updateMany(filter, update){
        return await cartModel.updateMany(filter, update);
    }

    async paginate(filter={}, options={}){
        return await cartModel.paginate(filter, options);
    }

    async populate(id, populatePath){
        return await cartModel
          .findOne({ _id: id })
          .lean()
          .populate(populatePath)
    }
}

export default MongoDaoCarts;