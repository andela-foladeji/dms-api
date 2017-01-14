const documentModel = (sequelize, DataType) => {
  const document = sequelize.define('document', {
    title: {
      type: DataType.STRING,
      allowNull: false,
      unique: true
    },
    content: {
      type: DataType.TEXT,
      allowNull: false
    },
    access: {
      type: DataType.STRING,
      defaultValue: 'public'
    }
  }, {
    classMethods: {
      associate: (models) => {
        document.belongsTo(models.user, {
          as: 'owner',
          foreignKey: {
            allowNull: false,
          },
          onDelete: 'CASCADE'
        });
      }
    }
  });

  return document;
};

export default documentModel;
