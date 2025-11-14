const express = require("express");
const itemController = require("../controllers/itemController");

const router = express.Router();

router.get("/", itemController.list);
router.get("/new", itemController.newForm);
router.post("/", itemController.create);
router.get("/:id", itemController.show);
router.get("/:id/edit", itemController.editForm);
router.put("/:id", itemController.update);
router.delete("/:id", itemController.destroy);

module.exports = router;
