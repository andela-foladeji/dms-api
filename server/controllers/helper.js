class Helper {
  /**
   * method returnUnAuthorized is to return Unauthorized message
   * @param {object} res; the response obect
   * @returns {object} response sent to the frontend
   */
  static returnUnAuthorized(res) {
    return res.status(401).json({
      message: 'Unauthorized request'
    });
  }
}

export default Helper;
