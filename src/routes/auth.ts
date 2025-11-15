import { Router } from "express";
import { getDb } from "../mongo";
import { Usuario, JwtPayload } from "../types";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

const router = Router();

dotenv.config();

const SECRET = process.env.SECRET;



const coleccion = () => getDb().collection<Usuario>("usuarios");

router.get("/", async (req, res)=>{
  res.send("Ruta auth conectada ...");
});


router.post("/register", async (req, res) => {
    try{
        const {email, password} = req.body as {email:string, password:string};
        const users = coleccion();

        const exists = await users.findOne({email});
        if(exists){
            return res.status(400).json({message: "Email ya existente"})
        };

        //encriptamos la password usando la libreria bcrypt 
        const encriptada = await bcrypt.hash(password,10);
        await users.insertOne({email, password: encriptada});

        res.status(201).json({message: "Usuario creado correctamente!"})

    }catch(err){
        res.status(500).json({message: err});
    }
});

router.post("/login", async (req, res)=>{
    try{
        const {email, password} = req.body as {email:string, password:string};

        const users = coleccion();

        const user = await users.findOne({email});
        if(!user) return res.status(404).json({message: "email existente"});


        //con compare se comprueba si la password encriptada corresponde a la real
        const validar = await bcrypt.compare(password, user.password);
        if(!validar) return res.status(404).json({message: "contraseña incorrecta"});

        //se genera el token para luego poder usar la lista de comics
        const token = jwt.sign({id: user._id?.toString(), email: user.email} as JwtPayload, SECRET as string, {
            expiresIn: "1h"
        });

        res.status(200).json({message: "Logeado correctamente", token})

    }catch(err){
        res.status(500).json({message: err});
    }
})



export default router;