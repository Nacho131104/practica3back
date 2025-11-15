import { ObjectId } from "mongodb";


export type Usuario = {
    _id?: ObjectId;
    email: string;
    password: string;
}
export type JwtPayload = {
    id: string;
    email: string;
}
export type Tebeo = {
    title: string;
    author: "autor"|"guionista";
    year: number;
    publisher?: string;
    userId: ObjectId;
}