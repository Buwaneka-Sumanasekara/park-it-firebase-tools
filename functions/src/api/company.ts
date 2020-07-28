import { Request, Response } from "express";
import * as admin from 'firebase-admin';
import { CompanyModal, ArUsersModel } from "../models";
import * as _ from 'lodash';
import * as UserAPI from "./user";





export async function createCompany(req: Request, res: Response) {
    try {
        const userId = req.headers["user_id"];
        const ParkName = req.body.name;
        UserAPI.getUserObject(userId).then(user => {
            const hasPermission = UserAPI.userHasPermission(user, 4000);
            if (hasPermission) {
                const ref = admin.database().ref(`companies`);
                const cr_date = admin.database.ServerValue.TIMESTAMP;



                const company_obj: CompanyModal = {
                    "name": ParkName,
                    "crdate": cr_date,
                    "crby": user
                };

               
                const ref_park = ref.push(company_obj).once("value");

                return ref_park
                    .then((park_snap) => {
                        return park_snap.child("access").child(user.id).ref.set(user).catch(error => Promise.reject(error))
                            .then(snap_val => {
                                if (park_snap.exists() && park_snap.key) {
                                    const parkSaved = park_snap.val();
                                    const access: ArUsersModel = {
                                        [user.id]: user
                                    };

                                    company_obj["id"] = park_snap.key;
                                    company_obj["crdate"] = parkSaved["crdate"];
                                    company_obj["access"] = access;

                                 
                                    res.status(200).send(company_obj);
                                } else {
                                    throw new Error("nooooo")

                                }
                            });
                    })
                    .catch((err) => {
                        res.status(500).send(err.message);
                    });
            } else {
                throw Error("No Permission");
            }
        }).catch(e => {
            throw e;
        });
    } catch (error) {
        res.status(500).send(error);
    }
}



export async function getCompanies(req: Request, res: Response) {
    try {
        const userId = req.headers["user_id"];

        if (userId !== undefined) {
            UserAPI.getUserObject(userId).then(async user => {
                const ref =await  admin.database().ref(`companies`).once("value");   
                const companies=ref.val();
                const filtered=_.map(companies,(o,key)=> {
                    if (o.access!==undefined && (o.access[user.id].id === user.id)){
                        const company:CompanyModal={
                            "id":key,
                            "name":o["name"],
                            "crby":o["crby"],
                            "access":o["access"]
                        }

                        return company;
                    }else{
                        return undefined;
                    };
                });
                res.status(200).send(_.without(filtered, undefined));
            }).catch(e => {
                throw e;
            });
        }else{
            throw new Error("No Company found")
        }

    } catch (error) {
        res.status(500).send(error);
    }
}



