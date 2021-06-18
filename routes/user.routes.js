const router = require('express').Router()

const { auth, userValidator } = require('../middleware')
const userController = require('../controllers/user.controller')

router.get('/', auth.denyAccess)

router.delete('/', auth.denyAccess)

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

router.post('/logout', userController.logout)

router.post('/refreshToken', userController.refreshToken)

router.post(
    '/forgotPassword',
    [userValidator.checkEmailExist],
    userController.forgotPassword
)

router.post('/cancelPasswordReset', userController.cancelPasswordReset)

router.post('/resetPassword', userController.resetPassword)

router.get('/user', userController.getUser)

router.put(
    '/:userId',
    [userValidator.checkUpdateDetails],
    userController.updateUser
)

router.delete(
    '/:userId',
    [userValidator.checkFindUserDetails],
    userController.deleteUser
)

module.exports = router
