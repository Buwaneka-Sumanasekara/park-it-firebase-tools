import { Request,Response } from "express";


export async function testAPIFun(req:Request, res:Response) {
    res.status(200).send({ 'msg': "wade goda" });
}