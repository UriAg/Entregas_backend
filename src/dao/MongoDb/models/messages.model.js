import mongoose from "mongoose";

const messageModel = mongoose.model('message', new mongoose.Schema({
    user: String,
    message: String,
}, { strict: true }))

export default messageModel;