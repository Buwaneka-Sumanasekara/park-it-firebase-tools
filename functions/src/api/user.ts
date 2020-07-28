import { Request, Response, NextFunction } from "express";
import * as admin from 'firebase-admin';
import * as _ from 'lodash';
import { UserModel } from "../models";


export const getFirebaseUserDetails = async (req: Request, res: Response) => {
    try {

        if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) &&
            !(req.cookies && req.cookies.__session)) {
           
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

    try {
        const user = await getFirebaseUserDetails(req, res);
       
        req.headers['user_id'] = user.user_id;
        next();
        return;

    } catch (error) {
        res.status(401).send({ "code": 401, "message": error.message });
        return;
    }
};




export const getUserDetails = async (req: Request, res: Response) => {

    try {
        const userId = req.headers["user_id"];

        return getUserObject(userId).then(user => {
            if (user !== null) {
                const userObj: UserModel = user;
                res.status(200).send(userObj);
            } else {
                res.status(404).send({ "message": "User not found" });
            }
        }).catch(e => {
            return e;
        });

    } catch (error) {
        res.status(500).send({ "message": error.message });
        return;
    }
};


export const userHasPermission = async (user: any, permission_id: Number) => {
    try {
        if (_.find(user.permissions, permission_id)) {
            return true;
        } else {
            throw new Error("Unauthorized for this action");
        }
    } catch (error) {
        return false;
    }
}

export const getUserObject = (user_id: any) => {
    try {
        if (user_id !== undefined && !_.isArray(user_id)) {
            const ref = admin.database().ref(`users/${user_id}`).once("value");
            return ref.catch(err => Promise.reject(err))
                .then((snapshot) => {
                    if (snapshot.exists() && snapshot.key) {
                        const snap = snapshot.val();
                        const userObj:UserModel = {
                            "id": snapshot.key,
                            "name": snap["name"],
                            "user_role":snap["user_role"]
                        };
                        return userObj;
                    } else {
                        throw Error("No user found");
                    }
                })
                .catch((err) => Promise.reject(err));
        } else {
            throw Error("No user found");
        }

    } catch (error) {
        throw error;
    }
}