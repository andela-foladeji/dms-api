import bCrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from '../models';
import Helper from './helper';

require('dotenv').config({ silent: true });
/**
 * UsersController class to handle all Users
 * related actions
 */
class UsersController extends Helper{

  /**
   * method fetchUser to create a User
   * @param {object} userInfo - information about user
   * @return {object} formatted object containing user information;
   */
  static fetchUser(userInfo) {
    const { firstName, lastName, username, createdAt, email, id, roleId } = userInfo;
    return { firstName, lastName, username, createdAt, email, id, roleId };
  }

  /**
   * method createUser to create a User
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} response to the front end;
   */
  static createUser(req, res) {
    db.user.create(req.body)
      .then((userInfo) => {
        const userDetails = UsersController.fetchUser(userInfo.dataValues);
        UsersController.getUserRole(userDetails.id, (role) => {
          const token = jwt.sign({ id: userDetails.id, role },
            process.env.SECRET, { expiresIn: '24h' });
          res.status(200).json({
            user: userDetails,
            token
          });
        });
      }).catch((error) => {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(400).json({
            message: 'Role does not exist'
          });
        }
        if (error.errors[0].type === 'unique violation') {
          return res.status(400).json({
            message: `${error.errors[0].path} already exists` });
        }
        if (error.errors[0].type === 'notNull Violation') {
          return res.status(400).json({
            message: `${error.errors[0].path} is required` });
        }
        res.status(500).json({ error });
      });
  }

  /**
   * method login to log a user in
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} jwtoken and status field;
   */
  static login(req, res) {
    db.user.findAll({
      where: {
        username: req.body.username
      },
      include: [db.role]
    }).then((userDetails) => {
      if (userDetails[0]) {
        const userInfo = UsersController.fetchUser(userDetails[0].dataValues);
        if (bCrypt.compareSync(req.body.password,
        userDetails[0].dataValues.password)) {
          const token = jwt.sign({
            id: userInfo.id,
            role: userDetails[0].dataValues.role.dataValues.title
          }, process.env.SECRET, { expiresIn: '24h' });
          return res.status(200).json({
            token,
            user: userInfo
          });
        }
        return res.status(401).json({
          message: 'Invalid user details'
        });
      }
      return res.status(401).json({
        message: 'Invalid user details'
      });
    }).catch((error) => {
      res.status(500).json({ error });
    });
  }

  /**
   * method getUsers to get a User
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {array} array of user objects;
   */
  static getUsers(req, res) {
    if (req.decoded.role.toLowerCase() === 'admin') {
      db.user.findAll({
        attributes: [
          'id', 'firstName', 'lastName', 'email', 'username',
          'createdAt', 'updatedAt', 'roleId'
        ]
      }).then(allUsers =>
        res.status(200).json({
          allUsers
        })
      );
    } else {
      Helper.returnUnAuthorized(res);
    }
  }

  /**
   * method getAuser to get a particular user details
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} userObject details;
   */
  static getAUser(req, res) {
    if ((req.decoded.id === parseInt(req.params.id, 10)) ||
    req.decoded.role.toLowerCase() === 'admin') {
      db.user.findById(req.params.id, {
        attributes: [
          'id', 'firstName', 'lastName', 'email', 'username',
          'createdAt', 'updatedAt', 'roleId'
        ]
      }).then((theUser) => {
        if(theUser) {
          return res.status(200).json({ user: theUser.dataValues });
        }
        return res.status(404).json({ message: 'User not found' });
      });
    } else {
      Helper.returnUnAuthorized(res);
    }
  }

  /**
   * method updateAUser to update user details
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} new userObject details;
   */
  static updateAUser(req, res) {
    if (req.decoded.id === parseInt(req.params.id, 10)) {
      db.user.update(req.body, {
        where: {
          id: req.decoded.id
        },
        fields: ['firstName', 'lastName', 'username', 'email',
          'password', 'roleId'],
        returning: true
      }).then(updatedUser =>
        res.status(200).json({
          user: UsersController.fetchUser(updatedUser[1][0].dataValues)
        })
      ).catch(error =>
        res.status(400).json({
          message: error.errors[0].message
        })
      );
    } else {
      Helper.returnUnAuthorized(res);
    }
  }

  /**
   * method deleteUser to update user details
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} details of the deletion;
   */
  static deleteUser(req, res) {
    if (req.decoded.id === parseInt(req.params.id, 10)) {
      db.user.destroy({ where: { id: req.decoded.id } }).then(() =>
        res.status(200).json({ done: true })
      ).catch(error =>
        res.status(400).json({
          message: error.errors[0].message
        })
      );
    } else {
      Helper.returnUnAuthorized(res);
    }
  }

  /**
   * method getUserRole to get the role of a user
   * @param {integer} userId - id of the user
   * @param {function} callback function
   * @return {function} callback function
   */
  static getUserRole(userId, callback) {
    db.user.findAll({
      where: {
        id: userId
      },
      include: [db.role]
    }).then(userInfo =>
      callback(userInfo[0].dataValues.role.title)
    ).catch(() =>
      callback(false)
    );
  }

  /**
   * method getUserDocuments to get a user documents
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {array} array of documents;
   */
  static getUserDocuments(req, res) {
    const userId = parseInt(req.params.id, 10);
    db.document.findAll({ ownerId: userId, order: [['createdAt', 'DESC']] })
      .then(documents => res.status(200).json({ doc: documents }));
  }

  /**
   * method logout to log a user out
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} details of the deletion;
   */
  static logout(req, res) {
    res.status(200).json({ msg: 'Logout successful' });
  }
}

export default UsersController;
