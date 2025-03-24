export default {
  authentication: {
    welcome: 'Welcome back',
    welcomeSubTitle: 'Enter your details to sign in.',
    createAccount: 'Create an account',
    createSubTitle: 'Enter your details to get started.',
    forgotPassword: 'Forgot password',
    forgotSubTitle: 'Enter your email to reset your password.',
    resetPassword: 'Reset password',
    resetSubTitle: 'Update your password.',
    tokenRequired: 'Authentication Required',
    tokenRequiredDescription: 'No valid token is available for this request.',
    resetPwAccessDenied: 'Access Denied',
    resetPwAccessDeniedDescription:
      "Your session may have expired or you haven't logged in yet.",
    resetPwAccessDeniedDescription2:
      'To access this resource, you need to authenticate with a valid token. Please log in.',
    actions: {
      signIn: 'Sign in',
    },
  },
} as const;
