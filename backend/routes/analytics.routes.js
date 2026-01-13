const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/analytics.controller");

router.use(auth);
router.get("/dashboard", c.dashboard);

module.exports = router;
