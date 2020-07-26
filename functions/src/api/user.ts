import { Request, Response, NextFunction } from "express";
import * as admin from 'firebase-admin';

export const validateFirebaseIdToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Check if request is authorized with Firebase ID token');
    try {
        if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
            !(req.cookies && req.cookies.__session)) {
            console.error('No token');
            throw new Error("Unauthorized");
        }

        let idToken;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            console.log('Found "Authorization" header');
            // Read the ID Token from the Authorization header.
            idToken = req.headers.authorization.split('Bearer ')[1];
        } else if (req.cookies) {
            console.log('Found "__session" cookie');
            // Read the ID Token from cookie.
            idToken = req.cookies.__session;
        } else {
            // No cookie
            throw new Error("Unauthorized dd");
        }


        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        console.log('ID Token correctly decoded', decodedIdToken);
        //req.user = decodedIdToken;
        next();
        return;

    } catch (error) {
        res.status(401).send({"code":401,"message":"Unauthorizedddd dd "});
        return;
    }


};