import jwt from 'jsonwebtoken';

require('dotenv').config({ silent: true });

/**
 * class for JWT verification and authorization
 */
class Authentication {

  /**
   * method verify to verify if the token is valid
   * @param {object} req - request
   * @param {object} res - response
   * @param {function} next function
   * @return {boolean} true if token is valid;
   */
  static verify(req, res, next) {
    if (!req.headers.authorization) {
      return res
        .status(401).json({ done: false, message: 'Please login' });
    }
    jwt.verify(req.headers.authorization,
      process.env.SECRET, (err, decoded) => {
        if (err) {
          return res
            .status(401)
            .json({ done: false, message: 'Token authentication failed' });
        }
        req.decoded = decoded;
        req.token = req.headers.authorization;
        next();
      });
  }
}

export default Authentication;
