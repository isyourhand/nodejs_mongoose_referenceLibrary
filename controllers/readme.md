### handlerFactory.js

文件集成了几个常用的请求处理，如 getAll，getOne，deleteOne，updateOne，createOne。方便其它 controller 直接调用，使代码更加清洁。

### authController.js

用于身份验证相关，主要依靠 JWT 和 cookie 来达成。

#### isLoggedIn

先检查 request 的 cookie 中是否有 jwt。如果是，对 jwt 解码，用解码出来的 id 查找用户。检查用户是否存在，检查 jwt 生成时间是否早于密码修改时间。

#### 现在我要添加一个新功能。

服务器验证好用户提交的注册信息后存入数据库，这里应该加个限定条件？比如说此账号不生效，然后发送一封邮件到邮箱里，用户点击邮箱里的按钮后账号才生效。这里的难点在于

### - errorController.js

几乎是所有错误的处理站，主要是为了简洁代码，提高代码可读性和功能模块化。

### - viewsController.js

用来渲染页面的控制器。
