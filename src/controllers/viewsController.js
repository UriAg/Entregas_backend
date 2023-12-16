import productsService from "../services/products.service.js";
import cartService from "../services/cart.service.js";
import { generateProducts } from "../utils.js";
import CustomError from "../services/errors/CustomError.js";
import { IdNotFoundProductError, invalidIdProductError } from "../services/errors/productErrors.js";
import { errorTypes } from "../services/errors/enums.js";
import { isValidObjectId } from "mongoose";
import handleErrors from "../middlewares/errors/handleErrors.js";
import userService from "../services/users.service.js";

async function renderRegister(req, res){       
    res.setHeader('Content-Type', 'text/html');

    let err = false;
    let errDetail = '';

    if(req.query.error){
        err = true;
        errDetail = req.query.error
    }

    return res.status(200).render('register', {
        loginVisible:true,
        err,
        errDetail,
    });
}

async function renderLogin(req, res){       
    res.setHeader('Content-Type', 'text/html');

    let err = false;
    let errDetail = '';
    let createdUser = false;
    let userEmail = '';

    if(req.query.error){
        err = true;
        errDetail = req.query.error
    }

    if(req.query.createdUser){
        createdUser = true;
        userEmail = req.query.createdUser
    }

    return res.status(200).render('login', {
        loginVisible:true,
        err,
        errDetail,
        createdUser,
        userEmail
    });
}

function renderHome(req,res){
    res.setHeader('Content-Type','text/html');
    return res.status(200).render('home', {
        loginVisible:false
    });
}

async function renderProfile(req,res){
    res.setHeader('Content-Type', 'text/html');
    
    const user = await userService.getUserById(req.user._id);

    return res.status(200).render('profile', {
        loginVisible:false,
        userId: req.user._id,
        userName: req.user.name,
        userLastName: req.user.last_name,
        userRole: user.role,
        userEmail: req.user.email
    });
}

async function renderRealTimeProducts(req, res, next){
    res.setHeader('Content-Type','text/html');
    try{
        const products = await productsService.getProducts();
        return res.status(200).render('realTimeProducts', {products:products});
    } catch {
        req.logger.error(`Error al obtener productos de la DB, detalle: ${error.message}`);
        next(error); 
    }
}

function renderChat(req,res){
    res.setHeader('Content-Type','text/html');
    return res.status(200).render('chat');
}

function renderContactForm(req,res){
    let { message, error } = req.query
    res.setHeader('Content-Type','text/html');
    return res.status(200).render('contact', {message, error});
}

async function renderCart(req, res, next){
    res.setHeader('Content-Type','text/html');
    let { message, messageSuccess } = req.query
    try {
        const cart = await cartService.populateCart(req.user.cart, 'products.product')
        let stockNotAvailable = false;
        let modifiedCart = [];

        cart.products.forEach(product=>{
            if(product.quantity>product.product.stock){
                stockNotAvailable = true;
            }else{
                stockNotAvailable = false;
            }
            let modifiedProduct = {...product, stockNotAvailable}
            modifiedCart.push(modifiedProduct)
        })
        return res.status(200).render('cartDetail', { nonCartSelected: false, modifiedCart, message, messageSuccess });
    } catch (error) {
        req.logger.error(`Error al obtener el carrito, detalle: ${error.message}`);
        next(error);
    }
}

async function renderProducts(req ,res, next){
    res.setHeader('Content-Type','text/html');
    const { limit = 10, page = 1, sort='desc', query } = req.query;

    const options = {
        page: parseInt(page), // Número de página
        limit: parseInt(limit), // Cantidad de resultados por página
        lean: true
    };

    // Opciones de ordenamiento
    if (sort) {
        const sortOrder = sort === 'asc' ? 1 : sort === 'desc' ? -1 : 0;
        if (sortOrder !== 0) {
            options.sort = { price: sortOrder };
        }
    }

    // Opciones de filtro
    const filter = query ? { category: query } : {};

    try {
        const products = await productsService.paginateProduct(filter, options); // Realiza la consulta con paginación
        const responseData = {
            products: products.docs, // Lista de productos en la página actual
            totalPages: products.totalPages, // Total de páginas
            hasPrevPage: products.hasPrevPage, // Indica si hay una página anterior
            hasNextPage: products.hasNextPage, // Indica si hay una página siguiente
            prevPage: products.prevPage, // Número de página anterior
            nextPage: products.nextPage, // Número de página siguiente
        };

        return res.status(200).render('products', {responseData});

    } catch (error) {
        req.logger.error(`Error al obtener productos de la DB, detalle: ${error.message}`);
        next(error);
    }

}

async function renderProductDetails(req, res, next){
    res.setHeader('Content-Type','text/html');
    let pid = req.params.pid
    try {
        if(!isValidObjectId(pid)){
            CustomError.createError({
                name:'Invalid product id',
                cause: invalidIdProductError(pid),
                message: 'Error trying to create product',
                code: errorTypes.INVALID_ARGS_ERROR
            })
        }

        let responseData = await productsService.getProductById(pid);

        if(!responseData){
            CustomError.createError({
                name:"Product doesn't exists",
                cause: IdNotFoundProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.NOT_FOUND_ERROR
            })
        }

        return res.status(200).render('productDetail', {product: responseData});
    } catch (error) {
        req.logger.error(`Error al obtener producto de la DB, detalle: ${error.message}`);
        next(error);    
    }
}

async function productMocking(req, res, next){
    res.setHeader('Content-Type','text/html');
    try {
        let products = [];
        for(let i=0; i<50; i++){
            products.push(generateProducts());
        }
        let uploadProducts = await productsService.createManyProducts(products);   
        return res.status(200).redirect('/?message=products upload successfuly')
    } catch (error) {
        req.logger.error(`Error al subir mock de productos a la DB, detalle: ${error.message}`);
        next(error);           
    }
}

async function loggerTest(req, res){
    res.setHeader('Content-Type','application/json');

    req.logger.debug(`Test de logger debug`);
    req.logger.http(`Test de logger http`);
    req.logger.info(`Test de logger info`);
    req.logger.warning(`Test de logger warning`);
    req.logger.error(`Test de logger error`);
    req.logger.fatal(`Test de logger fatal`);

    return res.status(200).send('Loggers enviados!!');
}

async function recoveryPassword(req, res){
    res.setHeader('Content-Type','text/html');
    return res.status(200).render('recoveryPassword');
}

async function resetPassword(req, res, next){
    res.setHeader('Content-Type','text/html');
    const token = req.params.token;
    const email = req.params.email;
    const error = req.query.error;
    try{
        const user = await userService.getUserByEmail(email)
        if(token !== user.token.info) return res.status(400).render('login', {err:true, errDetail:"Token isn't the same or the provided token has already been used, please generate another"})
        
        const timestamp = user.token.timestamp;
        const horaActual = Date.now();
        const limiteDeVida = 60 * 60 * 1000; // 1 hora en milisegundos
        
        if (horaActual - timestamp > limiteDeVida) {
            const filter = { email: email };
            const update = { $set: { token: {info:"", timestamp:""} } };
            await userService.updateUser(filter, update);
            return res.status(200).render('regenerateLink')
        }
    
        return res.status(200).render('changePassword', {email: email, error});
    }catch(error){
        next(error)
    }
}

function notFound(req, res){
    return res.status(404).redirect('/');
}

export default {
    renderRegister,
    renderLogin,
    renderHome,
    renderProfile,
    renderRealTimeProducts,
    renderChat,
    renderContactForm,
    renderCart,
    renderProducts,
    renderProductDetails,
    productMocking,
    loggerTest,
    recoveryPassword,
    resetPassword,
    notFound
}