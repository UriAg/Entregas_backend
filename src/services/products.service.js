import MongoDaoProducts from "../dao/MongoDb/mongoDaoProducts.js"

class ProductsService{
    constructor(dao){
        this.dao=new dao()
    }

    async getProducts(){
        return await this.dao.get()
    }

    async getProductById(id){
        return await this.dao.getOne({_id: id})
    }

    async paginateProduct(filter, options){
        return await this.dao.paginate(filter, options)
    }

    async updateOne(filter, options){
        return await this.dao.updateOne(filter, options)
    }

    async createProduct({title, description, code, price, status=true, thumbnail, stock, category}){
        return await this.dao.create({title, description, code, price, status, thumbnail, stock, category})
    }

    async createManyProducts(products){
        return await this.dao.createMany(products)
    }

    async deleteProduct(id){
        return await this.dao.deleteOne({_id: id})
    }
}

const productsService = new ProductsService(MongoDaoProducts)

export default productsService  