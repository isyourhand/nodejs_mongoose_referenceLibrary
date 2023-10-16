### handlerFactory.js

handlerFactory 集成了几个常用的请求处理，如 getAll，getOne，deleteOne，updateOne，createOne。方便其它 controller 直接调用，使代码更加清洁。

handlerFactory integrates several commonly used request handlers, such as getAll，getOne，deleteOne，updateOne，createOne. it facilitates direct invocations by other controllers, making the code cleaner.

### authController.js

用于身份验证相关，主要依靠 JWT 和 cookie 来达成。authController 比较重要，下面进行详细介绍。

Authentication, relies on JWT and cookies. authController is importance, I will provide a detailed introduction for the internal functions.

#### - createSendToken

创建 token 存储在 cookie 中返回。

create a token and store it in cookie.

#### - isLoggedIn

用于 render page。先检查 request 的 cookie 中是否有 jwt。如果是，对 jwt 解码，用解码出来的 id 查找用户。检查用户是否存在，检查 jwt 生成时间是否早于密码修改时间。

Utilize it when rendering page. Check whether the 'req' object contains a JWT within the cookie. if it does, decode the jwt and use the extracted ID to search for the user if it exist, and also verify the jwt generation time.

#### - protect

用于 api，检查是否有 token，以及 token 是否能通过验证，密码是否更改过。

Utilize it when using API. Verify the presence of token, authenticate the token, and also check whether the password has been changed.

#### - restrictTo

检查用户类型是否符合要求。

Ensure that the user type meets the requirements.

<!-- 想要了解下面两个 API 的详细逻辑，必须结合 usermodel 中的中间件 createPasswordResetToken 使用。 -->
<!-- To understand the detailed logic of the following two APIs, it is necessary to combine them with the middleware 'createPasswordResetToken' in the usermodel -->

#### - fogotPassword

用邮箱作为关键词在数据库里查找相关用户，创建一个 resetToken 既存进用户文档也作为修改密码网址的 URL 的一部分发送到用户邮箱。

Use 'email' as keyword to search for the relative user in the database. Then, create a resetToken store it in the user document. Also, use resetToken as part of URL for the resetPassword website and send it to user's email.

#### - resetPassword

这个 api 是和 fogotPassword 配套使用的。介绍一下过程大概是，用特定方式加密 resetToken 得到 hashToken，然后用 hashToken 和当前时间作为关键词在数据库查找用户，用户存在就可以修改密码了。

This API is designed to work in conjunction with the 'forgotPassword'. Here's a brief overview of resetPassword: The resetToken is encrypted in a specific way to obtain a hashToken. Then, the hashToken, along with the current time, is used as keywords to search for the user in the database. If the user exists,proceed to change password.

<!-- ##### - 现在我要添加一个新功能。

服务器验证好用户提交的注册信息后存入数据库，这里应该加个限定条件？比如说此账号不生效，然后发送一封邮件到邮箱里，用户点击邮箱里的按钮后账号才生效。这里的难点在于怎么在点击后激活账号，然后发送 jwt。

注册要检查数据库中是否存在相同邮箱，存在且 active 为 false 就把数据库中的数据删除，在存入用户新注册的数据，然后给邮箱发送激活邮件

当用户注册时，账户的 active 属性为 false，必须在邮件里激活。
(以上暂时不实现。)

---

重置密码分两种。 1.用户登录了，然后要重置密码。 2.用户未登录，忘记密码，然后要重置密码。
点击忘记密码->出现输入邮箱页面->点击邮箱给出的网址->进入网址提交新密码。
现在，我也要把事情变得简单点，直接默认两个都需要邮箱验证。 -->

### errorController.js

几乎是所有错误的处理站，主要是为了简洁代码，提高代码可读性。

Almost all error handling stations. it primarily aimed at concise code, improving code readability.

### viewsController.js

用来渲染页面的控制器。

The controller used for rendering pages.
