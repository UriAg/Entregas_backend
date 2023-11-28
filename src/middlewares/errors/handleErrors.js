import { errorTypes } from "../../services/errors/enums.js";
export default (error, req, res, next)=>{
    switch(error.code){
        case errorTypes.AUTHENTICATION_ERROR:
            res.send({status:'error', error:error.name, description:error.description})
            break;
        case errorTypes.AUTHORIZATION_ERROR:
            res.send({status:'error', error:error.name, description:error.description})
            break;
        case errorTypes.INVALID_ARGS_ERROR:
            res.send({status:'error', error:error.name, description:error.description})
            break;
        case errorTypes.NOT_FOUND_ERROR:
            res.send({status:'error', error:error.name, description:error.description})
            break;
        case errorTypes.SERVER_SIDE_ERROR:
            res.send({status:'error', error:error.name, description:error.description})
            break;
        default: 
            res.send({status:'error', error:'Unhandled error'})
    }
  
}