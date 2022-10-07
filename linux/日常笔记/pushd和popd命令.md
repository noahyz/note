## pushd 和 popd 命令

- dirs 命令，可以显示目录栈中（或历史）的目录

  ```
  # dirs -v
  0	/tmp
  1	~
  ```

- pushd 命令会增加一个目录到栈顶。当把一个新的目录入栈时，会打印出当前位于栈中的所有目录

  ```
  # pushd ~/Documents 
  ~/Documents /tmp ~
  # pushd ~/Desktop 
  ~/Desktop ~/Documents /tmp ~
  ```

  如上，目录索引按照倒序排列，即：

  ```
  ~/Desktop 是目录栈中第 4 个目录，索引为 0
  ~/Documents 是目录栈中第 3 个目录，索引为 1
  依次类推
  ```

- popd 命令会从栈顶移除一个目录。只需输入 popd 即可

  ```bash
  # popd
  ~/Documents /tmp ~
  ```

- 我们也可以使用索引的方式来添加目录入栈，或者剔除目录出栈。后面带的是索引号

  ```
  pushd +2 
  popd +1
  ```

  