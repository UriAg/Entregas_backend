import { MyRouter } from "./Schema/router.js";
import { passportCall } from "../../../utils.js";
import cartController from "../../../controllers/cartController.js";

class CustomCartRouter extends MyRouter{
    init(){
        
        this.get('/purchase', ['USER', 'PREMIUM', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), cartController.purchaseCart)

        this.post('/:pid/:pq', ['USER', 'PREMIUM', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), cartController.addProductToCart)

        this.delete('/product/:pid', ['USER', 'PREMIUM', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), cartController.deleteProductFromCart)

        this.get('*', ['PUBLIC'], cartController.notFound)
    }
}

export default CustomCartRouter;