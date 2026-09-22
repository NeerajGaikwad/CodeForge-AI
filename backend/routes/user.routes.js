import express from 'express';
import * as userController from '../controllers/user.controller.js';
import * as authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();


// ==================== AUTH ====================

router.post('/register', userController.createUserController);

router.post(
    '/verify-signup',
    userController.verifySignupOTPController
);

router.post('/login', userController.loginController);

router.post(
    '/verify-login',
    userController.verifyLoginOTPController
);

// Demo login - NO OTP
router.post(
    '/demo-login',
    userController.demoLoginController
);


// ==================== USER PROFILE ====================

router.get(
    '/profile',
    authMiddleware.authUser,
    userController.getProfileController
);

router.put(
    '/update-profile',
    authMiddleware.authUser,
    userController.updateProfileController
);

router.post(
    '/update-avatar',
    authMiddleware.authUser,
    userController.updateAvatarController
);

router.put(
    '/update-password',
    authMiddleware.authUser,
    userController.updatePasswordController
);

router.put(
    '/change-email',
    authMiddleware.authUser,
    userController.changeEmailController
);


// ==================== PASSWORD RESET ====================

router.post(
    '/forgot-password',
    userController.forgotPasswordController
);

router.post(
    '/reset-password',
    userController.resetPasswordController
);


// ==================== USERS ====================

router.get(
    '/all',
    authMiddleware.authUser,
    userController.getAllUsersController
);

router.get(
    '/search',
    authMiddleware.authUser,
    userController.searchUserController
);


// ==================== LOGOUT ====================

router.get(
    '/logout',
    authMiddleware.authUser,
    userController.logoutController
);


export default router;