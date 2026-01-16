const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/broker.controller");

router.use(auth);
router.get("/", c.list);

module.exports = router;
