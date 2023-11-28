import MongoDaoUsers from "../dao/MongoDb/mongoDaoUsers.js";

class UserService{
    constructor(dao){
        this.dao=new dao();
    }

    async getUsers(){
        return await this.dao.get();
    }

    async getUserByEmail(email){
        return await this.dao.getOne({email: email});
    }

    async getUserById(id){
        return await this.dao.getOne({_id: id});
    }

    async createUser({name, last_name, email, role, password, cart}){
        return await this.dao.create({name, last_name, email, role, password, cart});
    }

    async createUserWithGithub({name, last_name, email, role, password, cart}){
        return await this.dao.create({name, last_name, email, role, password, cart});
    }
}

const userService = new UserService(MongoDaoUsers);

export default userService;