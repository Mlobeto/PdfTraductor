module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PdfData', {
    permitNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    applicationNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    constructionPermitFor: {
      type: DataTypes.STRING,
      allowNull: true
    },
    applicant: {
      type: DataTypes.STRING,
      allowNull: true
    },
    propertyAddress: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lot: {
      type: DataTypes.STRING,
      allowNull: true
    },
    block: {
      type: DataTypes.STRING,
      allowNull: true
    },
    propertyId: {
      type: DataTypes.STRING,
      allowNull: true
    },
    systemType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    configuration: {
      type: DataTypes.STRING,
      allowNull: true
    },
    locationBenchmark: {
      type: DataTypes.STRING,
      allowNull: true
    },
    elevation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    drainfieldDepth: {
      type: DataTypes.STRING,
      allowNull: true
    },
    fillRequired: {
      type: DataTypes.STRING,
      allowNull: true
    },
    specificationsBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    approvedBy: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dateIssued: {
      type: DataTypes.DATE,
      allowNull: true
    },
    expirationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    greaseInterceptorCapacity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dosingTankCapacity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gpdCapacity: {
      type: DataTypes.STRING,
      allowNull: true
    },
    squareFeetSystem: {
      type: DataTypes.STRING,
      allowNull: true
    },
    other: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });
};