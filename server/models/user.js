const bCrypt = require('bcrypt');

const userModel = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    firstName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    classMethods: {
      associate: (models) => {
        user.belongsTo(models.role, {
          foreignKey: {
            allowNull: false
          },
          onDelete: 'CASCADE'
        });
        user.hasMany(models.document, {
          foreignKey: {
            name: 'ownerId',
            allowNull: false,
          },
          onDelete: 'CASCADE'
        });
      }
    },
    hooks: {
      beforeCreate: (theUser) => {
        theUser.password = bCrypt.hashSync(theUser.password,
          bCrypt.genSaltSync(8));
      },
      beforeUpdate: (theUser) => {
        theUser.password = bCrypt.hashSync(theUser.password,
          bCrypt.genSaltSync(8));
      }
    }
  });
  return user;
};

export default userModel;
