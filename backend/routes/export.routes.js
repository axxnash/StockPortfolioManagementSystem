const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/export.controller");

router.use(auth);
router.get("/portfolio", c.exportCsv);

module.exports = router;
