import {Request,Response} from 'express';
import knex from '../database/connection';

class PointsController{

    async index(request:Request,response:Response){
        const {city,uf, items} = request.query;

        const parsedItems = String(items)
            .split(',')
            .map(item=> Number(item.trim()));

        const points = await knex('points')
        .join('point_items','points.id','=','point_items.point_id')
        .whereIn('point_items.item_id',parsedItems)
        .where('city',String(city))
        .where('uf',String(uf))
        .distinct()
        .select('points.*');

        const serializePoints = points.map(point => {
          return {
            ...point,
            image_url: `http://192.168.100.2:3333/uploads/${point.image}`,
          };
        });

        return response.json(serializePoints);
    }

    async show(request:Request,response:Response) {
      const { id } = request.params;

      const point = await knex('points').where('id',id).first();

      if(!point){
          return response.status(400).json({message:'Point not found.'});
      }

      /**
       * SELECT title FROM items
       *    JOIN point_items ON items.id = point_items.item_id
       * WHERE point_items.point_id = {id}
       */

      const items = await knex('items')
        .join('point_items','items.id','=','point_items.item_id')
        .where('point_items.point_id',id)
        .select('items.title');

      const serializePoint = {
          ...point,
          image_url: `http://192.168.100.2:3333/uploads/${point.image}`,
        };

      return response.json({point:serializePoint,items});

    }
    async create(request:Request,response:Response){
        
        const {
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf,
            items
          } = request.body;
          
          const point = {
            image: request.file.filename,
            name,
            email,
            whatsapp,
            latitude,
            longitude,
            city,
            uf
        };

          const insertedIds =  await knex('points').insert(point);
          
          const point_id = insertedIds[0];

          const pointItems = items
          .split(',')
          .map((item:string) => Number(item.trim()))
          .map((item_id: number) =>{
            return {
              item_id,
              point_id
            };
          })
        
        
           await knex('point_items').insert(pointItems);
        
          return response.json({ 
            id:point_id,  
            ...point,
            });
        }
    }


export default PointsController;