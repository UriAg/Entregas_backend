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

    async createUser(user){
        return await this.dao.create(user);
    }

    async updateUser(filter, user){
        return await this.dao.updateOne(filter, user);
    }

    async createUserWithGithub(user){
        return await this.dao.create(user);
    }
}

const userService = new UserService(MongoDaoUsers);

export default userService;