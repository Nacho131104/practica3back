import express from "express";
import { connectmongodb } from "./mongo";
import rutasAuth from "./routes/auth";
import rutasComics from "./routes/comicVault"
import dotenv from "dotenv";

dotenv.config();

connectmongodb();

const app = express();
app.use(express.json());
app.use("/auth", rutasAuth);
app.use("/comics", rutasComics);

app.listen(3000, () => console.log("API funcionando.... "));