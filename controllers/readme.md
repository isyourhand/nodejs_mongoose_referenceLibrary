#### handlerFactory.js

handlerFactory integrates several commonly used request handlers, such as getAll，getOne，deleteOne，updateOne，createOne. it facilitates direct invocations by other controllers, making the code cleaner.

#### authController.js

Authentication, relies on JWT and cookies. authController is importance, I will provide a detailed introduction for the internal functions.

##### - createSendToken

create a token and store it in cookie.

##### - isLoggedIn

Utilize it when rendering page. Check whether the 'req' object contains a JWT within the cookie. if it does, decode the jwt and use the extracted ID to search for the user if it exist, and also verify the jwt generation time.

##### - protect

Utilize it when using API. Verify the presence of token, authenticate the token, and also check whether the password has been changed.

##### - restrictTo

Ensure that the user type meets the requirements.

---

To understand the detailed logic of the following two APIs, it is necessary to combine them with the middleware 'createPasswordResetToken' in the usermodel

##### - fogotPassword

Use 'email' as keyword to search for the relative user in the database. Then, create a resetToken store it in the user document. Also, use resetToken as part of URL for the resetPassword website and send it to user's email.

##### - resetPassword

This API is designed to work in conjunction with the 'forgotPassword'. Here's a brief overview of resetPassword: The resetToken is encrypted in a specific way to obtain a hashToken. Then, the hashToken, along with the current time, is used as keywords to search for the user in the database. If the user exists,proceed to change password.

#### errorController.js

Almost all error handling stations. it primarily aimed at concise code, improving code readability.

#### viewsController.js

The controller used for rendering pages.
