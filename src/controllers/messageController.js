import { serverSocket } from "../app.js";
import handleErrors from "../middlewares/errors/handleErrors.js";
import messagesService from "../services/messages.service.js";

async function searchMessages(req,res){
    res.setHeader('Content-Type','application/json');
    try {
        let messages = await messagesService.getMessages();
    
        return res.json(messages);
        
    } catch (error) {
        req.logger.error(`Error al buscar mensajes, detalle: ${error.message}`);
        next(error);
    }
    
}

async function uploadMessage(req,res){
    res.setHeader('Content-Type','application/json');
    const {
        user,
        message
    } = req.body;

    try {
        let newMessage = await messagesService.createMessage({
            user,
            message
        })

        await newMessage.save();

        let messages = await messagesService.getMessages();

        serverSocket.emit('newMessage', newMessage, messages);

        return res.status(201).json({ message: 'message send', User: user, Text: message });

    } catch (error) {
        req.logger.error(`Error al subir el mensaje a la DB, detalle: ${error.message}`);
        next(error);
    }
}

async function deleteChat(req,res){
    res.setHeader('Content-Type','application/json');
    try {
        await messagesService.deleteAllMessages();
        
        let messages = await messagesService.getMessages();
        
        serverSocket.emit('cleanMessage', messages);
        
        return res.status(201).json({ message: 'chat deleted'});
    } catch (error) {
        req.logger.error(`Error al eliminar el chat, detalle: ${error.message}`);
        next(error);
    }
}

export default { searchMessages, uploadMessage, deleteChat }