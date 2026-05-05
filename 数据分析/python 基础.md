numpy 的认识

```
核心结构：ndarray 对象，实际上是多维数组的含义。

# numpy 中 dtype 的固定用法
persontype = np.dtype({
    'names': ['name', 'age', 'chinese', 'math', 'english'],
    'formats': ['S31', 'i', 'i', 'i', 'f']
})
peoples = np.array([
    ("ZhangFei", 32, 75, 100, 90),
    ("GuanYu", 24, 85, 96, 88.5),
    ("ZhaoYun", 28, 85, 92, 96.5),
    ("HuangZhong", 29, 65, 85, 100)],
    dtype=persontype)
ages = peoples[:]['age']

# 创建等差数列，初始值、终值(不包括)、步长
x1 = np.arange(1,11,2)

# 两个数组的运算：加减乘除、求N次方、取余数
x1 = np.arange(1, 11, 2)
x2 = np.linspace(1, 9, 5)
print(x1)
print(x2)
print(np.add(x1, x2))
print(np.subtract(x1, x2))
print(np.multiply(x1, x2))
print(np.divide(x1, x2))
print(np.power(x1, x2))
print(np.remainder(x1, x2))

# 数组的排序
a = np.array([[4,3,2], [2,4,1]])
print(np.sort(a))
```

pandas 的认识

```
Series 是定长的字典序列，定长是指在存储时，相当于两个 ndarray。和字典结构不同，字典中元素的个数是不固定的。
Series 有两个基本属性：index 和 values。其中 index 默认是 0,1,2,...递增的整数序列。当然也可以自己指定索引。

x1 = Series([1, 2, 3, 4])
x2 = Series(data=[1, 2, 3, 4], index=['A', 'B', 'C', 'D'])
print(x1)
print(x2)


DataFrame 类型数据结构：类似于数据库表，包含了行索引和列索引。

data = {'Chinese': [66, 95, 93, 90,80],'English': [65, 85, 92, 88, 90],'Math': [30, 98, 96, 77, 90]}
df1 = DataFrame(data)
df2 = DataFrame(data, index=['Zhangfei', 'Guangyu', 'Zhaoyun', 'Huangzhong', 'Dianwei'], columns=['English', 'Math', 'Chinese'])
print(df1)
print(df2)

# pandas 允许直接从 xlsx、csv等文件中导入数据，也可以输出到 xlsx、csv 等文件。
score = DataFrame(pd.read_excel('data.xlsx')) 
score.to_excel('data1.xlsx')

# 删除不必要的行或列
df2 = df2.drop(columns=['Chinese'])
df2 = df2.drop(index=['Zhangfei'])

# 重命名
df2.rename(columns={'Chinese': "YuWen", 'English': 'Yingyu', 'Math': 'Shuxue'}, inplace=True)

# 去重复的值
df2 = df2.drop_duplicates()

# 重命名，删除数据间的空格
df2['Chinese'] = df2['Chinese'].astype('str')
df2['Chinese'] = df2['Chinese'].map(str.strip)
df2['Chinese']=df2['Chinese'].str.strip('$')  # 删除数据中的特殊符号

# 大小写转换
df2.columns = df2.columns.str.upper()
df2.columns = df2.columns.str.lower()
df2.columns = df2.columns.str.title()  # 首字母大写

# 查找空值
df.isnull().any()
df.fillna(0)

# 统计函数
df.describe()

# 数据表的合并
df3 = pd.merge(df1, df2, on='name')
df3 = pd.merge(df1, df2, how='inner') # inner 内连接就是键的交集
df3 = pd.merge(df1, df2, how='left')  # left 左连接
df3 = pd.merge(df1, df2, how='right')  # right 右连接
df3 = pd.merge(df1, df2, how='outer')  # outer 外连接，并集

# 新增一列，求多列的总和
df1['total_sum'] = df1['yuwen'] + df1['yingyu'] + df1['shuxue']
```

