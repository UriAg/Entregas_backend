import { MyRouter } from "./Schema/router.js";
import { passportCall } from "../../../utils.js";
import messageController from "../../../controllers/messageController.js";

class CustomMessagesRouter extends MyRouter{
    init(){
        this.get('/', ['USER', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), messageController.searchMessages)

        this.post('/', ['USER', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), messageController.uploadMessage)

        this.delete('/', ['USER', 'ADMIN', 'CREATOR'], passportCall('jwt', '/login'), messageController.deleteChat)
    }
}

export default CustomMessagesRouter;