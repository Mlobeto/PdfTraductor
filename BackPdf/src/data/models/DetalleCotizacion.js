const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  sequelize.define('DetalleCotizacion', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    quoteId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Cotizacions',
        key: 'id'
      }
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Products',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    }
  });
};