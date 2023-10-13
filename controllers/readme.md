### handlerFactory.js

文件集成了几个常用的请求处理，如 getAll，getOne，deleteOne，updateOne，createOne。方便其它 controller 直接调用，使代码更加清洁。

### authController.js

用于身份验证相关，主要依靠 JWT 和 cookie 来达成。

#### - isLoggedIn

先检查 request 的 cookie 中是否有 jwt。如果是，对 jwt 解码，用解码出来的 id 查找用户。检查用户是否存在，检查 jwt 生成时间是否早于密码修改时间。

##### - 现在我要添加一个新功能。

服务器验证好用户提交的注册信息后存入数据库，这里应该加个限定条件？比如说此账号不生效，然后发送一封邮件到邮箱里，用户点击邮箱里的按钮后账号才生效。这里的难点在于怎么在点击后激活账号，然后发送 jwt。

注册要检查数据库中是否存在相同邮箱，存在且 active 为 false 就把数据库中的数据删除，在存入用户新注册的数据，然后给邮箱发送激活邮件

当用户注册时，账户的 active 属性为 false，必须在邮件里激活。
(以上暂时不实现。)

---

重置密码分两种。 1.用户登录了，然后要重置密码。 2.用户未登录，忘记密码，然后要重置密码。
点击忘记密码->出现输入邮箱页面->点击邮箱给出的网址->进入网址提交新密码。
现在，我也要把事情变得简单点，直接默认两个都需要邮箱验证。

### errorController.js

几乎是所有错误的处理站，主要是为了简洁代码，提高代码可读性和功能模块化。

### viewsController.js

用来渲染页面的控制器。