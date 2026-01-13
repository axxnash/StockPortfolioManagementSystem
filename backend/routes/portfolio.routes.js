const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/portfolio.controller");

router.use(auth);
router.post("/", c.create);
router.get("/", c.list);
router.delete("/:id", c.remove);

module.exports = router;
