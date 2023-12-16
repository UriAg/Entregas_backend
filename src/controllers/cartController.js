import { v4 as uuidv4 } from 'uuid';
import { transporter } from "../services/contact.service.js";
import productsService from "../services/products.service.js";
import cartService from "../services/cart.service.js";
import ticketService from "../services/ticket.service.js";
import config from '../config/config.js';
import { errorTypes } from '../services/errors/enums.js';
import { isValidObjectId } from 'mongoose';
import CustomError from '../services/errors/CustomError.js';
import { IdNotFoundProductError, invalidIdProductError } from '../services/errors/productErrors.js';

async function addProductToCart(req, res, next){
    res.setHeader('Content-Type','application/json');
    const { pid, pq } = req.params;
    try {

        if(!isValidObjectId(pid)){
            CustomError.createError({
                name:'Product id not found',
                cause: invalidIdProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.INVALID_ARGS_ERROR
            })
        }
        const product = await productsService.getProductById(pid);

        if(!product){
            CustomError.createError({
                name:"Products doesn't exists",
                cause: IdNotFoundProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.NOT_FOUND_ERROR 
            })
        }

        if(product.owner.toString() === req.user._id){
            CustomError.createError({
                name:"Cannot add this product",
                cause: "You can't add this product to your because you are the owner",
                message: 'Error trying to add product',
                code: errorTypes.AUTHENTICATION_ERROR 
            })
        }

        const existingProduct = await cartService.getCart({_id: req.user.cart, products: { $elemMatch: { product: pid } } })
        
        if(existingProduct){
            const filter = {
                _id: req.user.cart, products: { $elemMatch: { product: pid } }
            }

            const update = {
                $inc: { 'products.$.quantity': pq }
            };
           
            const addedAmount = await cartService.updateCart(filter, update);
            return res.status(201).json({message: 'Cantidad agregada con éxito', cart: addedAmount});
        }else{

            const update = {
                $push: { products: {product: pid, quantity: pq} }
            };
        
            const addedProduct = await cartService.updateCart({ _id: req.user.cart }, update);
            return res.status(201).json({message: 'Producto agregado con éxito', cart: addedProduct});
        }
    
    } catch (error) {
        req.logger.error(`Error al añadir producto al carrito, detalle: ${error.message}`);
        next(error);
    }
}

async function purchaseCart(req, res, next){
    let outOfStock = [];
    let purchasedProducts = [];
    try {
        let productsOnCart = await cartService.getCartById(req.user.cart)
        let amount = 0;
        for(const product of productsOnCart.products){
            const productStock = await productsService.getProductById(product.product);
            if(product.quantity>productStock.stock){
                let productToPurchase = {
                    title:productStock.title,
                    code:productStock.code,
                    price:productStock.price,
                    quantity:product.quantity,
                    category:productStock.category
                }
                outOfStock.push(productToPurchase);
                
            }else{
                let productToPurchase = {
                    id: productStock._id,
                    title: productStock.title,
                    code: productStock.code,
                    price: productStock.price,
                    quantity: product.quantity,
                    category: productStock.category
                }
                purchasedProducts.push(productToPurchase);

                const updateProduct = await productsService.updateOne(
                    {_id:product.product},
                    {$inc: { 'stock': - product.quantity }}
                )
                
                
                purchasedProducts.map(product=>{
                    amount+=(product.price*product.quantity);
                    cartService.updateCart(
                        { _id: req.user.cart },
                        { $pull: { products: { product: product.id } } }
                    );
                })

                await ticketService.createTicket({
                    products: purchasedProducts,
                    amount,
                    purchaser: req.user.email,
                    code: uuidv4()
                })                
            }
            
        }

        await transporter.transporter.sendMail({
            from: config.MAIL_USER,
            to: req.user.email,
            subject: 'Ticket de compra',
            html:`
                <div style="width:100%; text-align:center;">
                
                    <h1>¡Muchas gracias por tu compra!</h1>
                    <p>A continuación te enviamos los detalles de tu compra</p>

                    <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%;">
                        <div style="display:flex; align-items:center; justify-content:center; width:100%">
                            ${purchasedProducts.map(product => `
                                <ul style="background-color: #ebebeb; margin:0.5em; padding:0; width:100%; text-align:center">
                                    <span>Producto: </span>
                                    <li style="list-style:none;" >Nombre: ${product.title}</li>
                                    <li style="list-style:none;" >ID: ${product.id}</li>
                                    <li style="list-style:none;" >Categoría: ${product.category}</li>
                                    <li style="list-style:none;" >Cantidad: ${product.quantity} unidades</li>
                                    <li style="list-style:none;" >Precio: $${product.price}</li>
                                    <li style="list-style:none;" >Subtotal: $${product.price*product.quantity}</li>
                                </ul>
                            `).join('')}
                        </div>
                    </div>
                    <div style="text-align:center; width: 100%;">
                        <p>Total: $${amount}</p>
                    </div>

                </div>
            `
        }).catch(err=>console.log(err));
        //SUPONGO QUE ACÁ SE REDIRECCIONA AL CHECKOUT O ESTO FORMA PARTE DEL CHECKOUT
        if(outOfStock.length){
            return res.status(200).redirect('/cart?message=Algunos productos no cuentan con el stock suficiente')
        }else{
            return res.status(200).redirect('/cart?messageSuccess=Compra realizada satisfactoriamente')
        }
        
    }catch(error) {
        req.logger.error(`Error al realizar la compra, detalle: ${error.message}`);
        next(error);
    }
}

async function deleteProductFromCart(req, res, next){
    const pid = req.params.pid;
    try {
        if(!isValidObjectId(pid)){
            CustomError.createError({
                name:'Product id not found',
                cause: idProductError(pid),
                message: 'Error trying to find product',
                code: errorTypes.INVALID_ARGS_ERROR 
            })
        }

        const existingProduct = await productsService.getProductById(pid);
        
        if (!existingProduct) {
            CustomError.createError({
                name:"Product doesn't exists",
                cause: invalidIdProductError(pid),
                message: 'Error trying to find cart',
                code: errorTypes.NOT_FOUND_ERROR 
            })
        }

        const cart = await cartService.getCartById(req.user.cart);
  
        if (!cart) {
            CustomError.createError({
                name:"Cart doesn't exists",
                cause: idCartError(pid),
                message: 'Error trying to find cart',
                code: errorTypes.NOT_FOUND_ERROR 
            })
        }
        cart.products = cart.products.filter(product => product.product !== pid);
  
        await cart.save();
  
        return res.status(200).json({ message: 'Producto eliminado del carrito con éxito', cart });
    } catch (error) {
        req.logger.error(`Error al eliminar producto del carrito, detalle: ${error.message}`);
        next(error);
    }    
}

function notFound(req, res){
    return res.status(404).redirect('/home');
}

export default { addProductToCart, deleteProductFromCart, purchaseCart, notFound }