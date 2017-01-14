import db from '../models';
import user from './users-controller';
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
        }).catch(() => {
          res.status(400).json({ done: false });
        });
    } else {
      user.returnUnAuthroized(res);
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
      res.status(200).json({ done: true, roles });
    }).catch((error) => {
      res.status(500).json({ done: false, error });
    });
  }
}

export default RoleController;
