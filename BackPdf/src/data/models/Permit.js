module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Permit', {

    idPermit:{
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    permitNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    applicationNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    documentNumber: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    constructionPermitFor: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    applicant: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    propertyAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    lot: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    block: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    propertyId: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    systemType: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    configuration: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    locationBenchmark: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    elevation: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    drainfieldDepth: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fillRequired: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specificationsBy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dateIssued: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    expirationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    greaseInterceptorCapacity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dosingTankCapacity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    gpdCapacity: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exavationRequired:{
      type: DataTypes.TEXT,
      allowNull: true
    },
    squareFeetSystem: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    other: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    isATU:{
      type: DataTypes.BOOLEAN,
      allowNull: true
    },

    pump:{
      type: DataTypes.TEXT,
      allowNull: true
    },
  }, {
    timestamps: true
  });
};