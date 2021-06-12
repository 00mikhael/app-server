const router = require('express').Router()

const { auth, userValidator } = require('../middleware')
const adminController = require('../controllers/admin.controller')
const userController = require('../controllers/user.controller')

router.post(
    '/register',
    [
        auth.verifyToken,
        auth.isAdmin,
        userValidator.checkRegisterDetails,
        userValidator.checkUserExist,
        userValidator.checkRolesExist
    ],
    adminController.register
)

router.post('/login', [userValidator.checkLoginDetails], adminController.login)

router.post('/refreshToken', userController.refreshToken)

router.post(
    '/forgotPassword',
    [userValidator.checkEmailExist],
    userController.forgotPassword
)

router.post('/resetPassword', userController.resetPassword)

router.post('/cancelPasswordReset', userController.cancelPasswordReset)

router.get(
    '/all/users',
    [auth.verifyToken, auth.isAdmin],
    adminController.findAll
)

router.get(
    '/:userId',
    [auth.verifyToken, auth.isAdmin, userValidator.checkFindUserDetails],
    userController.getUser
)

router.delete(
    '/:userId',
    [auth.verifyToken, userValidator.checkFindUserDetails],
    userController.deleteUser
)

module.exports = router
