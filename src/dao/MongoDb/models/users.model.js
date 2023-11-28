import mongoose from "mongoose";

const usersModel = mongoose.model('users', new mongoose.Schema({
    name:String,
    last_name:String,
    email:{
        type:String,
        unique:true
    },
    role: {
        type:String,
        default:'user'
    },
    password:String,
    cart:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'carts'
    },
    github:{}
}, {
    timestamps:true
}))

export default usersModel; 