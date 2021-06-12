const router = require('express').Router()

const { auth, userValidator } = require('../middleware')
const userController = require('../controllers/user.controller')

router.post(
    '/register',
    [
        userValidator.checkRegisterDetails,
        userValidator.checkUserExist,
        userValidator.checkRolesExist
    ],
    userController.register
)

router.post('/login', [userValidator.checkLoginDetails], userController.login)

router.post('/refreshToken', userController.refreshToken)

router.post(
    '/forgotPassword',
    [userValidator.checkEmailExist],
    userController.forgotPassword
)

router.post('/cancelPasswordReset', userController.cancelPasswordReset)

router.post('/resetPassword', userController.resetPassword)

router.get(
    '/:userId',
    [auth.verifyToken, userValidator.checkFindUserDetails],
    userController.getUser
)

router.put(
    '/:userId',
    [auth.verifyToken, userValidator.checkUpdateDetails],
    userController.updateUser
)

router.delete(
    '/:userId',
    [auth.verifyToken, userValidator.checkFindUserDetails],
    userController.deleteUser
)

module.exports = router
