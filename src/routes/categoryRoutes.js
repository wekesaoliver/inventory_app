const express = require("express");
const categoryController = require("../controllers/categoryController");

const router = express.Router();

router.get("/", categoryController.list);
router.get("/new", categoryController.newForm);
router.post("/", categoryController.create);
router.get("/:slug", categoryController.show);
router.get("/:slug/edit", categoryController.editForm);
router.put("/:slug", categoryController.update);
router.delete("/:slug", categoryController.destroy);

module.exports = router;
