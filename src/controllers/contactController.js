import { send, transporter } from "../services/contact.service.js";

async function makeContact(req,res, next){
    res.setHeader('Content-Type','application/json');
    let { from, to, subject, message } = req.body;
    try {
        if(!from || !to || !subject || !message){
            return res.status(400).redirect('/contact?error=Rellene todos los campos')
        }

        await send(from, to, subject, message)
        return res.status(200).redirect('/contact?message=Correo enviado exitosamente')
            
    }catch(error) {
        req.logger.error(`Error al enviar el correo, detalle: ${error.message}`);
        next(error);
    }
}

export default { makeContact }