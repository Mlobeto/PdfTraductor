const isOwner = (req, res, next) => {
    if (req.user.role !== 'Owner') {
      return res.status(403).json({
        error: true,
        message: 'Acceso permitido solo para administradores'
      });
    }
    next();
  };
  
  const isCashier = (req, res, next) => {
    if (req.user.role !== 'Cashier') {
      return res.status(403).json({
        error: true,
        message: 'Acceso permitido solo para cajeros'
      });
    }
    next();
  };
  
  const isDistributor = (req, res, next) => {
    if (req.user.role !== 'Distributor') {
      return res.status(403).json({
        error: true,
        message: 'Acceso permitido solo para distribuidores'
      });
    }
    next();
  };
  
  module.exports = {
    isOwner,
    isCashier,
    isDistributor
  };