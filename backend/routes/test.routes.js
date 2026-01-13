const router = require("express").Router();
router.get("/", (_, res) => res.json({ message: "Backend working" }));
module.exports = router;
