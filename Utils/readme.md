### email.js

基于 nodemailer 模块，可以使用 gmail 发送邮件。再 config.env 中添加 GEMAIL_USERNAME 和 GEMAIL_PASSWORD 就可以使用，目前支持注册后发送邮件验证，重置密码，忘记密码。

### catchAsync.js

目的是简洁代码，可以直接用包装好的函数 catch 错误。

### appError.js

用在一些可预测错误的函数中处理错误。

### APIFeatures.js

对搜索结果处理的代码，比如排序，分页，设置满足条件...
