## 变量
* 等号两边避免空格
```shell
vara=1
```

### 字符串变量
### 整数变量
### 数组
* 整数数组
```shell
my_array=(1 2 3)
```
* 关联数组
``` shell
declare -A my_array
my_array["name"] = "jone"
```

## 变量使用
* 变量名称前面加$即可使用
* $后面花括号可加可不加，加上是为了让编译器更好识别，避免歧义。如：
``` shell
name="abc"
echo "My name is ${name}!"
```


## $用法
* $# 脚本入惨个数
* $* 入参列表（不包括$0）
* $$ shell本身的进程id
* $! shell最后运行的后退进程的id
* $@ 脚本传入的所有参数
* $0 执行的脚本名称
* $1 第一个参数
* $? 脚本执行状态 0 表示正常
* 

## if
### 文件相关
* -d 是否为目录
* -e 目录或文件是否存在
* -f 是否为文件
* -r 当前用户是否有权限读取
* -W 当前用户是否有权限写入
* -x 当前用户是否有权限执行
* -L 是否为软连接

### 数值比较
* -eq
* -ne
* -gt
* -lt
* -le
* -ge

### 字符串比较
* =
* !=
* -z 字符串内容为空

### 逻辑
* &&
* ||
* !

