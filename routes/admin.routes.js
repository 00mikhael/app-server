const router = require('express').Router()

const { auth, userValidator } = require('../middleware')
const adminController = require('../controllers/admin.controller')
const userController = require('../controllers/user.controller')

router.post(
    '/register',
    [
        auth.isAdmin,
        userValidator.checkRegisterDetails,
        userValidator.checkUserExist,
        userValidator.checkRolesExist
    ],
    adminController.register
)

router.post('/login', [userValidator.checkLoginDetails], userController.login)

router.post('/logout', userController.logout)

router.post('/refreshToken', userController.refreshToken)

router.post(
    '/forgotPassword',
    [userValidator.checkEmailExist],
    userController.forgotPassword
)

router.post('/resetPassword', userController.resetPassword)

router.post('/cancelPasswordReset', userController.cancelPasswordReset)

router.get('/all/users', [auth.isAdmin], adminController.findAll)

router.get(
    '/user',
    [auth.isAdmin, userValidator.checkFindUserDetails],
    userController.getUser
)

router.delete(
    '/:userId',
    [userValidator.checkFindUserDetails],
    userController.deleteUser
)

module.exports = router
