import MongoDaoMessages from "../dao/MongoDb/mongoDaoMessages.js"

class MessagesService{
    constructor(dao){
        this.dao=new dao()
    }

    async getMessages(){
        return await this.dao.get()
    }

    async createMessage(user, message){
        return await this.dao.create({
            user,
            message
        })
    }

    async deleteAllMessages(){
        return await this.dao.deleteAll()
    }

}

const messagesService = new MessagesService(MongoDaoMessages)

export default messagesService  