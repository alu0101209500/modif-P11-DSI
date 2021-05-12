import {spawn} from "child_process";
import * as express from "express";

/**
 * Almacena el objeto Express en una constante
 */
const app = express();

/**
 * Ante peticiones al punto execmd se ejecuta un comando y se devuelve la salida o un mensaje de error en formato JSON
 */
app.get("/execmd", (req, res) => {
    if(req.query.command === undefined){
        res.send(JSON.stringify({type: "err", desc: "Se debe incluir un comando"}));
    } else {
        let args: string[] = [];
        let data: string = "";
        let catchederror: string = "";
        if(req.query.args !== undefined){
            args = String(req.query.args).split(" ");
        }
        let comm = spawn(String(req.query.command), args);
        comm.stdout.on("data", (chunk) => {
            data += chunk;
        });
        comm.stderr.on("data", (chunk) => {
            catchederror += chunk;
        });
        comm.on("close", (code, _) => {
            if(Number(code) < 0){
                res.send(JSON.stringify({type: "err", desc: "El comando no existe"}));
            } else if (Number(code) === 0){
                res.send(JSON.stringify({type: "response", desc: data}));
            } else {
                res.send(JSON.stringify({type: "err", desc: catchederror}));
            }
        });
        comm.on("error", (err) => {
            console.log("Ha ocurrido un error " + err);
        });
    }
});

/**
 * Para cualquier otro punto devuelve un error 404
 */
app.get("*", (req, res) => {
    res.send("404");
});

/**
 * Pone el servidor a la escucha en el puerto 3000
 */
app.listen(3000, () => {
    console.log("Server a la escucha");
});