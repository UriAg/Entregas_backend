import { Schema, model } from "mongoose";
import mongoosePaginate from 'mongoose-paginate-v2'

const productsColl='products'
const productsSchema = new Schema({
    title: String,
    description: String,
    code: String,
    price: Number,
    status: Boolean,
    thumbnail: String,
    stock: Number,
    category: String
}, { 
    collection:"products",
    strict: true,
    timestamps: true
});

productsSchema.plugin(mongoosePaginate)

const productsModel=model(productsColl, productsSchema)

export default productsModel;