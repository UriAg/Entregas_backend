import { MyRouter } from "./Schema/router.js";
import { generateJWT, passportCall } from "../../../utils.js";
import viewsController from "../../../controllers/viewsController.js";

class CustomViewsRouter extends MyRouter{

    init(){
        this.get('/register', ['PUBLIC'], (req, res, next)=>{
            if(req.cookies.tokenCookie) return res.status(402).redirect('/');
            return next()
        }, viewsController.renderRegister)

        this.get('/login', ['PUBLIC'], (req, res, next)=>{
            if(req.cookies.tokenCookie) return res.status(402).redirect('/');
            return next()
        }, viewsController.renderLogin)

        this.get('/', ['PUBLIC'], (req,res,next)=>{
            if(req.cookies.tokenCookie){
                next()
            }else{
                return res.redirect('/login')
            }
        }, passportCall('jwt', '/login'), viewsController.renderHome)

        this.get('/profile', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.renderProfile)

        this.get('/realTimeProducts', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.renderRealTimeProducts)

        this.get('/chat', ['USER', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), viewsController.renderChat)
        
        this.get('/contact', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.renderContactForm)

        this.get('/cart', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.renderCart)

        this.get('/products', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.renderProducts)

        this.get('/products/:pid', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.renderProductDetails)

        this.get('/mockingproducts', ['ADMIN', 'CREATOR'], passportCall('jwt', '/login'), viewsController.productMocking)
        
        this.get('/loggerTest', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.loggerTest)
        
        this.get('/recoveryPassword', ['PUBLIC'], (req, res, next)=>{
            if(req.cookies.tokenCookie) return res.status(402).redirect('/');
            return next()
        }, viewsController.recoveryPassword)
        
        this.get('/reset-password/:token/:email', ['PUBLIC'], viewsController.resetPassword)

        this.get('/error', ['PUBLIC'], passportCall('jwt', '/login'), viewsController.notFound)
        
    }
}

export default CustomViewsRouter;