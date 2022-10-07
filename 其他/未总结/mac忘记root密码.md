mac 忘记 root 密码

重置密码

1. 普通用户登陆系统，然后打开终端，输入 sudo bash，密码输入当前普通用户的密码

```
-> sudo bash
Password:

The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
bash-3.2# 
```

2. 输入当前用户密码后，成功进入 bash-3.2 命令模式，在 bash-3.2 模式下，输入 `passwd root`，然后输入 root 的新密码和确认密码

```
> passwd root
```

3. root 密码以成功修改，可以退出先切换普通用户再通过 `su root`，输入刚设置的 root 新密码验证是否成功

