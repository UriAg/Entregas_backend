import { MyRouter } from "./Schema/router.js";
import { passportCall } from "../../../utils.js";
import contactController from "../../../controllers/contactController.js";

class CustomContactRouter extends MyRouter{
    init(){
        this.post('/', ['USER', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), contactController.makeContact)
    }
}

export default CustomContactRouter;