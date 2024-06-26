const express = require("express");
const postController = require("../controllers/postControllers");
const router = express.Router();
const protect = require('../middleware/authMiddleware');

router
  .route("/")
  .get(protect, postController.getAllPosts)
  .post(protect, postController.createPost);

router
  .route("/:id")
  .get(protect, postController.getPost)
  .put(protect, postController.updatePost)
  .delete(protect, postController.deletePost);


module.exports = router;