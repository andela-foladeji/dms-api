const roleModel = (sequelize, DataTypes) => {
  const role = sequelize.define('role', {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    }
  }, {
    classMethods: {
      associate: (models) => {
        role.hasMany(models.user, {
          foreignKey: {
            allowNull: false
          }
        });
      }
    }
  });
  return role;
};

export default roleModel;
