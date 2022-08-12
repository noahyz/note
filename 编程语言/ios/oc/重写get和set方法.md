## iOS 重写 get 和 set 方法

使用 @property 指令，编译器会自动生成 setter 和 getter 方法。

- 如果单独重写 getter 和 setter 方法，不会出现异常
- 但同时重写 getter 和 setter 方法，则会报错

原因：同时重写 getter 和 setter 方法，系统就不会自动生成 `_propertyName` 变量，所以报错

解决方案：添加 `@synthesize propertyName = _propertyName;`

```objective-c
#import "ViewController.h"

@interface ViewController ()

@property (nonatomic,strong)NSMutableArray *dataArr;
@end

@implementation ViewController
@synthesize dataArr = _dataArr;

- (void)viewDidLoad {
    [super viewDidLoad];
    // Do any additional setup after loading the view.
}

-(NSMutableArray *)dataArr{
    if (!_dataArr) {
        _dataArr = [NSMutableArray array];
    }
    return _dataArr;
}

-(void)setDataArr:(NSMutableArray *)dataArr{
    if (_dataArr != dataArr) {
        _dataArr = dataArr;
    }
}
@end
```

