export default class CustomError{
    static createError({name, cause, message, code}){
        let error = new Error(message, {cause});
        error.name = name;
        error.description = cause;
        error.code = code;
        throw error;
    }
}