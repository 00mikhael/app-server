const router = require('express').Router()

const { auth, postValidator } = require('../middleware')
const postController = require('../controllers/post.controller')

// Delete all posts
router.delete('/', auth.denyAccess)

// Create new posts
router.post('/', [postValidator.checkCreateDetails], postController.create)

// Retrieve all published posts
router.get('/', postController.findAllPublished)

router.get('/user', auth.denyAccess)

// Retrieve all posts by user
router.get(
    '/user/:userId',
    [postValidator.checkFindAllDetails],
    postController.findAllByUser
)

// Delete all by user id
router.delete(
    '/user/:userId',
    [postValidator.checkDeleteAllDetails],
    postController.deleteAllByUser
)

// Retrieve a single post with id
router.get('/:postId', postController.findOne)

// Update a single post with id
router.put(
    '/:postId',
    [postValidator.checkUpdateDetails],
    postController.update
)

// Delete a single post with id
router.delete(
    '/:postId',
    [postValidator.checkDeleteDetails],
    postController.delete
)

module.exports = router
