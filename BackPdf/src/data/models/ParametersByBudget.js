module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ParametersByBudget', {
        idParameters:{
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false
        },
        name:{
            type: DataTypes.STRING,
            allowNull: false
        },
       price:{
        type: DataTypes.DECIMAL,
        allowNull: false
       },
       description:{
        type: DataTypes.STRING,
        allowNull: true
       },
       active:{
        type: DataTypes.BOOLEAN,
        allowNull: false
       },

     
  })};