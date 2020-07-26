import { Request, Response, NextFunction } from "express";
import * as admin from 'firebase-admin';

export const getFirebaseUserDetails = async (req: Request, res: Response) => {
    try {

        if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
            !(req.cookies && req.cookies.__session)) {
            console.error('No token');
            throw new Error("Unauthorized");
        }
        let idToken;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            idToken = req.headers.authorization.split('Bearer ')[1];
            const decodedIdToken = await admin.auth().verifyIdToken(idToken);
            return decodedIdToken;
        } else {
            throw new Error("Token not found");
        }
    } catch (error) {
        throw error;
    }
}

export const validateFirebaseIdToken = async (req: Request, res: Response, next: NextFunction) => {
    console.log('Check if request is authorized with Firebase ID token');
    try {
        const user=await getFirebaseUserDetails(req,res);
        req.headers['user_id'] = user.user_id;
        next();
        return;

    } catch (error) {
        res.status(401).send({ "code": 401, "message": error.message });
        return;
    }
};


