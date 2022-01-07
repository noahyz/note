django框架参考：http://c.biancheng.net/django/
https://www.runoob.com/django/django-middleware.html
https://www.cnblogs.com/linxiyue/p/10800020.html

```shell
# 1.创建 Django 项目
django-admin startproject BookStore
# 2. 启动 Django 项目,默认端口8000。可以指定端口
python3 manage.py runserver 
指定端口：python3 manage.py runserver 6000 
指定地址：python3 manage.py runserver 0.0.0.0:8080
# 3. 查看 manage.py 文件相关子命令
manage.py help 
# 4. 数据库表迁移操作，每一次数据表更新后，都需要执行下面的两个命令 
python3 manage.py makemigrations
python3 manage.py migrate
# 5. 创建一个app
python3 manage.py startapp index
# 6. 创建超级管理员账户,用户名为admin，邮箱为 admin@163.com,然后在输入密码
python3 manage.py createsuperuser --username=admin -email=admin@163.com 
```

不同文件说明

```shell
1. manage.py: 一级子目录中的 manage.py 文件是管理 Django 项目的重要命令行工具，它主要用于启动项目、创建应用和完成数据库的迁移等。
2. __init__.py: 二级子目录中的 __init__.py 文件用于标识当前所在的目录是一个 Python 包，如果在此文件中，通过 import 导入其他方法或者包会被 Django 自动识别。
3. settings.py: settings.py 文件是 Django 项目的重要配置文件。项目启动时，settings.py 配置文件会被自动调用，而它定义的一些全局为 Django 运行提供参数，在此配置文件中也可以自定义一些变量，用于全局作用域的数据传递。
4. urls.py: url.py 文件用于记录 Django 项目的 URL 映射关系，它属于项目的基础路由配置文件，路由系统就是在这个文件中完成相应配置的，项目中的动态路径必须先经过该文件匹配，才能实现 Web 站点上资源的访问功能。
5. wsgl.py: wsgi.py 是 WSGI（Web Server Gateway Interface）服务器程序的入口文件，主要用于启动应用程序。它遵守 WSGI 协议并负责网络通讯部分的实现，只有在项目部署的时候才会用到它。
```

创建一个APP后 ` python3 manage.py startapp index` 这个 index app 的结构组成

```shell
admin.py: 用于将 Model 定义的数据表注册到管理后台，是 Django Admin 应用的配置文件
apps.py：用于应用程序本身的属性配置文件
models.py：用于定义应用中所需要的数据表
tests.py：用于编写当前应用程序的单元测试
一级目录下的 __init__.py 文件标识 index 应用是一个 Python 包
migrations 目录用于存储数据库迁移时生成的文件，该目录下的 __init__.py 文件标识 migrations 是一个 Python 包
```

当进行数据库表迁移成功之后，会在 index 应用下的 migrations 目录生成 0001_initial.py 文件。可以使用：

```shell
python3 manage.py sq;migrate index 0001_initial 
# 可以查看到迁移文件执行的SQL语句
```

路由转发

```shell
通常会在每个app里，创建各自的 urls.py 路由模块，然后从根路由出发，将 app 所属的 url 请求，全部转发到相应的 urls.py 模块中。
从主路由转发到各个应用路由的过程叫做路由的分发，通过 include() 函数来实现
```



