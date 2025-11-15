import { Router } from "express";
import { AuthRequest, verifyToken } from "../middleware/verifyToken";
import { Tebeo } from "../types";
import { getDb } from "../mongo";
import { ObjectId } from "mongodb";


const router = Router();

const coleccion = () => getDb().collection<Tebeo>("comicVault");


router.get("/user", verifyToken, (req: AuthRequest, res) => {
    res.json({
        message: "Acceso correcto",
        user: req.user
    })
});

router.get("/", verifyToken, async (req: AuthRequest, res) => {
    try {
      const page = Number(req.query?.page) || 1;
      const limit = Number(req.query?.limit) || 2;
      const skip = (page - 1) * limit;
      const comics =  await coleccion().find().skip(skip).limit(limit).toArray();
      res.json({
        info: {
          page: page,
          numberOfPeopleInPage: limit,
        },
        result: comics,
      });
    } catch (err) {
      res.status(404).json(err);
    }
  });

router.get("/:id", async (req, res) => {
    const id = req.params.id;
    if (id.length == 24) {
      const encontrado = await coleccion().findOne({
        _id: new ObjectId(id),
      });

      //si se encuentra el comic se devuelve, sino da errord
      encontrado
        ? res.json(encontrado)
        : res.status(404).json({ message: "Comic no encontrado, por favor pruebe con otro id" });
    } else {
      res
        .status(404)
        .json({ message: "Formato de ID incorrecto, prueba a introducirlo de nuevo" });
    }
  });

  router.post(`/`, async (req, res) => {
    try {
      const titulo = req.body?.title;
      const autor = req.body?.author;
      const anio = req.body?.year;
      const publisher = req.body?.publisher
      const id = req.body?.userId;

      //comprobamos los tipos del comic y si estan los atributos necesarios
      if (titulo && autor && anio && id && typeof titulo === "string" && typeof autor === "string" &&
        typeof anio === "number" && (!publisher? true : typeof publisher === "string") && (id.length === 24 && typeof id === "string")) {

        const insertado = await coleccion().insertOne(req.body);
        const idNueva = insertado.insertedId;
        const comicNuevo = await coleccion().findOne({ _id: idNueva});
        res.status(201).json(comicNuevo);

      } else {
        res.status(400).json({ message: "Los datos del comic nuevo no son validos" });
      }
    } catch (err) {
      res.status(400).json(err);
    }
  });

  router.put("/:id", async (req, res) => {
    try {
      const actualizado = await coleccion().updateOne(
        { _id: new ObjectId(req.params?.id) },
        { $set: req.body }
      );
      res.json(actualizado);
    } catch (err) {
      res.status(404).json(err);
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const borrado = await coleccion().deleteOne({
        _id: new ObjectId(req.params?.id),
      });
      res.json({ "Comic borrado:":borrado });
    } catch (err) {
      res.status(404).json(err);
    }
  });

export default router;