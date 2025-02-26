const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('Distributor', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'n_document'
      }
    },
    discountPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100
      }
    },
    creditLimit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    currentCredit: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0
    },
    paymentTerm: {
      type: DataTypes.INTEGER, // días
      defaultValue: 30
    }
  });
};