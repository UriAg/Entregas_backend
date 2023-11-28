import MongoDaoTicket from "../dao/MongoDb/mongoDaoTicket.router.js"

class TicketService{
    constructor(dao){
        this.dao=new dao()
    }

    async getTickets(filter){
        return await this.dao.get(filter)
    }

    // async populateCart(id, populatePath){
    //     return await this.dao.populate(id, populatePath)
    // }

    async createTicket(ticket){
        return await this.dao.create(ticket)
    }

}

const ticketService = new TicketService(MongoDaoTicket)

export default ticketService  