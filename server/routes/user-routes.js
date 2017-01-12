import express from 'express';
import Authentication from '../middlewares/authentication';
import UsersController from '../controllers/users-controller.js';

const userRoute = express.Router();

userRoute.route('/')
  .post(UsersController.createUser)
  .get(Authentication.verify, UsersController.getUsers);

userRoute.route('/:id')
  .get(Authentication.verify, UsersController.getAUser)
  .put(Authentication.verify, UsersController.updateAUser)
  .delete(Authentication.verify, UsersController.deleteUser);

userRoute.get('/:id/documents', Authentication.verify,
  UsersController.getUserDocuments);

userRoute.post('/login', UsersController.login);

userRoute.post('/logout', UsersController.logout);

export default userRoute;
