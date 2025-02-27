const { Router } = require('express');

const router = Router();


router.use("/user", require("./authRoutes"));
router.use('/pdf', require('./pdfRoutes'));

                                                                                                                                                           
module.exports = router;