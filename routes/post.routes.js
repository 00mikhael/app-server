const router = require('express').Router()

const { auth, postValidator } = require('../middleware')
const postController = require('../controllers/post.controller')

// Delete all posts
router.delete('/', [auth.verifyToken], auth.denyAccess)

// Create new posts
router.post(
    '/',
    [auth.verifyToken, postValidator.checkCreateDetails],
    postController.create
)

// Retrieve all published posts
router.get('/', postController.findAllPublished)

router.get('/user', [auth.verifyToken], auth.denyAccess)

// Retrieve all posts by user
router.get(
    '/user/:userId',
    [auth.verifyToken, postValidator.checkFindAllDetails],
    postController.findAllByUser
)

// Delete all by user id
router.delete(
    '/user/:userId',
    [auth.verifyToken, postValidator.checkDeleteAllDetails],
    postController.deleteAllByUser
)

// Retrieve a single post with id
router.get('/:postId', postController.findOne)

// Update a single post with id
router.put(
    '/:postId',
    [auth.verifyToken, postValidator.checkUpdateDetails],
    postController.update
)

// Delete a single post with id
router.delete(
    '/:postId',
    [auth.verifyToken, postValidator.checkDeleteDetails],
    postController.delete
)

module.exports = router
