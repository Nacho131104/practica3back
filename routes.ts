import {Router} from "express"
import { getDb } from "./mongo"


const router = Router()
const collection = () => getDb().collection("usuarios")

