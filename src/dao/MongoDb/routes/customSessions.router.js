import { MyRouter } from "./Schema/router.js";
import { passportCall } from "../../../utils.js";
import sessionController from "../../../controllers/sessionController.js";

class CustomSessionsRouter extends MyRouter{
    init(){
        this.post('/register', ['PUBLIC'], passportCall('register', '/register'), sessionController.redirectToLogin)

        this.post('/login', ['PUBLIC'], passportCall('login', '/login'), sessionController.generateLogin)

        this.get('/logout', ['PUBLIC'], passportCall('jwt', '/login'), sessionController.generateLogout)
    }
}

export default CustomSessionsRouter;