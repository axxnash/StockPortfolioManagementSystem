const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/holding.controller");

router.use(auth);
router.post("/", c.add);
router.get("/", c.list);
router.put("/:id", c.update);
router.delete("/:id", c.remove);

module.exports = router;
