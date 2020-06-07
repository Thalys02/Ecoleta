import express from "express";

import PointsController from './Controllers/PointsController';
import ItemsController from './Controllers/ItemsController';

const pointsController =  new PointsController();
const itemsController = new ItemsController();

const routes = express.Router();

/**
 * Rotas dos items
 */
routes.get('/items',itemsController.index);


/**
 * Rotas dos Points
 */
routes.post('/points',pointsController.create);
routes.get('/points',pointsController.index);
routes.get('/points/:id',pointsController.show);

export default routes;
