import db from '../models';
import user from './users-controller';
import Helper from './helper';
/**
 * RoleController class to handle all role
 * related actions
 */
class RoleController {
  /**
   * method createRole to create a role
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} new role details;
   */
  static createRole(req, res) {
    if (req.decoded.role.toLowerCase() === 'admin') {
      db.role.create(req.body)
        .then((role) => {
          res.status(200).json({ role: role.dataValues, done: true });
        }).catch((error) => {
          res.status(400).json({ error });
        });
    } else {
      Helper.returnUnAuthorized(res);
    }
  }

  /**
   * method getRoles to get all roles in the db
   * @param {object} req - request details
   * @param {object} res - response details
   * @return {object} containing the array of roles if any;
   */
  static getRoles(req, res) {
    db.role.findAll().then((roles) => {
      res.status(200).json({ roles });
    }).catch((error) => {
      res.status(500).json({ error });
    });
  }
}

export default RoleController;
