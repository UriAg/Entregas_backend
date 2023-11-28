import { MyRouter } from "./Schema/router.js";
import { passportCall } from "../../../utils.js";
import productController from "../../../controllers/productController.js";

class CustomProductsRouter extends MyRouter{
    init(){
        this.post('/', ['ADMIN', 'CREATOR'], passportCall('jwt', '/login'), productController.uploadProductToDB)

        this.put('/:pid', ['ADMIN', 'CREATOR'], passportCall('jwt', '/login'), productController.editProductFromDB)

        this.delete('/:pid', ['ADMIN', 'CREATOR'], passportCall('jwt', '/login'), productController.deleteProductFromDB)

        this.get('*', ['PUBLIC'], passportCall('jwt', '/login'), productController.notFound)
    }
}

export default CustomProductsRouter;