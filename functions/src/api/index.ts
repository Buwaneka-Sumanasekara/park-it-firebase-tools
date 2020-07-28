import * as functions from 'firebase-functions'
import * as express from 'express';
//import * as bodyParser from "body-parser";
import * as cors from "cors";

import * as testApi from './test';
import * as userApi from './user';
import * as companyApi from './company';





const app = express();
app.use(cors());
app.use(userApi.validateFirebaseIdToken);
app.get('/test', testApi.testAPIFun);
app.get('/test2', testApi.testAPIFun);

app.get('/user', userApi.getUserDetails);

app.post('/company', companyApi.createCompany);
app.get('/companies', companyApi.getCompanies);


const main = express();



main.use('/api/v1', app);
//main.use(bodyParser.json());
//main.use(bodyParser.urlencoded({ extended: false }));
export const webApi = functions.https.onRequest(main);