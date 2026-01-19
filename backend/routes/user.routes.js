const router = require("express").Router();
const auth = require("../middleware/auth");
const c = require("../controllers/user.controller");

router.use(auth);
router.get("/profile", c.getProfile);
router.put("/profile", c.updateProfile);

module.exports = router;
