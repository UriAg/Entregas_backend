import { MyRouter } from "./Schema/router.js";
import { passportCall } from "../../../utils.js";
import sessionController from "../../../controllers/sessionController.js";

class CustomSessionsRouter extends MyRouter{
    init(){
        this.post('/register', ['PUBLIC'], passportCall('register', '/register'), sessionController.redirectToLogin)

        this.post('/login', ['PUBLIC'], passportCall('login', '/login'), sessionController.generateLogin)
        
        this.get('/premium/:uid', ['USER', 'PREMIUM'], passportCall('jwt', '/login'), sessionController.changeRole)

        this.post('/forgotPassword', ['PUBLIC'], sessionController.forgotPass)

        this.post('/changePassword/:email', ['PUBLIC'], sessionController.changePassword)

        this.get('/logout', ['PUBLIC'], passportCall('jwt', '/login'), sessionController.generateLogout)
    }
}

export default CustomSessionsRouter;