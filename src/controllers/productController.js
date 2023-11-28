import { serverSocket } from "../app.js";
import cartService from "../services/cart.service.js";
import CustomError from "../services/errors/CustomError.js";
import { IdNotFoundProductError, argsProductError, invalidIdProductError } from "../services/errors/productErrors.js";
import { errorTypes } from "../services/errors/enums.js";
import productsService from "../services/products.service.js";
import { isValidObjectId } from "mongoose";
import handleErrors from "../middlewares/errors/handleErrors.js";

async function uploadProductToDB(req,res){
    res.setHeader('Content-Type','application/json');
    const {
        title,
        description,
        code,
        price,
        thumbnail,
        stock,
        category
    } = req.body;

    let stringData = [title, description, code, thumbnail, category];
    let numberData = [price, stock];
    try {

        if(!title || !description || !code || !price || !thumbnail || !stock || !category){
            CustomError.createError({
                name:'Product creation error',
                cause: argsProductError({title, description, code, price, thumbnail, stock, category}),
                message: 'Error trying to create product',
                code: errorTypes.INVALID_ARGS_ERROR 
            })
        }
        
        if(!stringData.every((element) => typeof element === "string") || !numberData.every((element) => typeof element === "number")){
            CustomError.createError({
                name:'Product creation error',
                cause: argsProductError({title, description, code, price, thumbnail, stock, category}),
                message: 'Error trying to create product',
                code: errorTypes.INVALID_ARGS_ERROR 
            })
        }

        let newProduct = await productsService.createProduct({
            title,
            description,
            code,
            price,
            status: true,
            thumbnail,
            stock,
            category
        })

        await newProduct.save();

        let products = await productsService.getProducts()

        serverSocket.emit('newProduct', newProduct, products);

        return res.status(201).json({ message: 'Producto creado con éxito', product: newProduct });

    } catch (error) {
        req.logger.error(`Error al subir producto a la DB, detalle: ${error.message}`);
        next();
    }
}

async function editProductFromDB(req,res){
    res.setHeader('Content-Type','application/json');
    const pid = req.params.pid;
    try {

        if(!isValidObjectId(pid)){
            CustomError.createError({
                name:'Invalid product id',
                cause: invalidIdProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.INVALID_ARGS_ERROR
            })
        }

        const productToUpdate = await productsService.getProductById(pid)

        if (!productToUpdate) {
            CustomError.createError({
                name:"Products doesn't exists",
                cause: IdNotFoundProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.NOT_FOUND_ERROR 
            })
        }

        const {
            title,
            description,
            code,
            price,
            thumbnail,
            stock,
            category
        } = req.body;

        if(!title || !description || !code || !price || !thumbnail || !stock || !category){
            CustomError.createError({
                name:'Product creation error',
                cause: argsProductError({title, description, code, price, thumbnail, stock, category}),
                message: 'Error trying to create product',
                code: errorTypes.INVALID_ARGS_ERROR 
            })
        }

        if(typeof title, description, code, category !== String || typeof price, stock !== Number){
            CustomError.createError({
                name:'Product creation error',
                cause: argsProductError({title, description, code, price, thumbnail, stock, category}),
                message: 'Error trying to create product',
                code: errorTypes.INVALID_ARGS_ERROR 
            })
        }
        //CAMBIAR ESTE CODIGO Y BUSCAR OTRO QUE CUMPLE LO MISMO
        productToUpdate.title = title;
        productToUpdate.description = description;
        productToUpdate.code = code;
        productToUpdate.price = price;
        productToUpdate.thumbnail = thumbnail;
        productToUpdate.stock = stock;
        productToUpdate.category = category;

        await productToUpdate.save();

        return res.status(200).json({ message: 'Producto modificado con éxito', product: productToUpdate });
    } catch (error) {
        req.logger.error(`Error al modificar producto de la DB, detalle: ${error.message}`);
        next();
    }
}

async function deleteProductFromDB(req,res){
    res.setHeader('Content-Type','text/html');
    const pid = req.params.pid
    try {
        if(!isValidObjectId(pid)){
            CustomError.createError({
                name:'Product id not found',
                cause: invalidIdProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.INVALID_ARGS_ERROR
            })
        }

        const productToDelete = await productsService.getProductById(pid);
        console.log(productToDelete)
        if (!productToDelete) {
            CustomError.createError({
                name:"Product doesn't exists",
                cause: IdNotFoundProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.NOT_FOUND_ERROR 
            })
        }
        const deletedProduct = await productsService.deleteProduct(pid);

        const isProductOnCarts = await cartService.getCart({products:{$elemMatch:{product:pid}}})
        if(isProductOnCarts){
            const deleteProductFromCarts = await cartService.updateCarts(
                { products: { $elemMatch: { product: pid } } },
                { $pull: { products: { product: pid } } }
            );
        }

        let products = await productsService.getProducts();

        serverSocket.emit('productDeleted', { productId: pid, products });
        return res.status(200).json({ message: 'Producto eliminado con éxito', product: productToDelete, products: products });
    } catch (error) {
        req.logger.error(`Error al eliminar producto de la DB, detalle: ${error.message}`);
        next();
    }
}

function notFound(req,res){
    res.setHeader('Content-Type','text/html');
    return res.status(404).redirect('/')
}


export default { uploadProductToDB, editProductFromDB, deleteProductFromDB, notFound }