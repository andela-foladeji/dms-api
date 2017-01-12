import express from 'express';
import Authentication from '../middlewares/authentication';
import roleControl from '../controllers/role-controller';

const roleRoute = express.Router();

roleRoute.route('/')
  .post(Authentication.verify, roleControl.createRole)
  .get(Authentication.verify, roleControl.getRoles);

export default roleRoute;
