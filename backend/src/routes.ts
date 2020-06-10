import express from "express";
import { celebrate,Joi } from 'celebrate';

import multer from 'multer';
import multerConfig from './config/multer';

import PointsController from './Controllers/PointsController';
import ItemsController from './Controllers/ItemsController';

const pointsController =  new PointsController();
const itemsController = new ItemsController();

const routes = express.Router();
const upload = multer(multerConfig);

/**
 * Rotas dos items
 */
routes.get('/items',itemsController.index);


/**
 * Rotas dos Points
 */
routes.get('/points',pointsController.index);
routes.get('/points/:id',pointsController.show);

routes.post(
    '/points',
    upload.single('image'),
    celebrate({
        body:Joi.object().keys({
            name:Joi.string().required(),
            email:Joi.string().required().email(),
            whatsapp: Joi.number().required(),
            latitude:Joi.number().required(),
            longitude:Joi.number().required(),
            city:Joi.string().required(),
            uf:Joi.string().required().max(2),
            items:Joi.string().required(),
        })
    }),
    pointsController.create
);


export default routes;
