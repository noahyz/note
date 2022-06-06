## select

- select 控制结构中包含 default 语句时，能在 channel 上进行非阻塞的收发操作
- select 在遇到多个 channel 同时响应时，会随机执行一种情况。引入随机性就是为了避免饥饿问题发生

### 一、实现原理

select 语句在编译期间会被转换成 OSELECT 节点。每个 OSELECT 节点都会持有一组 OCASE 节点，每一个 OCASE 节点既包含执行条件，也包含满足条件后执行的代码。如果 OCASE 的执行条件为空，就意味着这是一个 default 节点。

编译器会根据 select 中的 case 的不同对控制语句进行优化，分为四种情况：

#### 1. select 不存在任何 case

直接将类似 `select{}` 的语句转换成调用 `runtime.block` 函数，而 `runtime.block` 函数会调用 `runtime.gopark` 让出当前 Goroutine 对处理器的使用权，并传入等待原因 `waitReasonSelectNoCases`。也就是说，空的 select 语句会阻塞当前 Goroutine，导致 Goroutine 进入无法被唤醒的永久休眠状态

#### 2. select 只存在一个 case

编译器会将 select 改写成 if 条件语句，判断 channel 中是否可发送或可接受。当 case 中的 channel 是空指针时，会直接挂起当前 Goroutine 并陷入永久休眠

#### 3. select 存在两个 case，其中一个是 default

有 default 的 case，编译器会认为这是一次非阻塞的收发操作。会先将 case 中所有的 channel 都转换成指向 channel 的地址。 

- 发送过程：当 case 中表达式的类型是 OSEND 时，编译器会优化成 if 条件语句和 `runtime.selectnbsend` （not block）函数。而 `runtime.selectnbsend` 函数会有一个 block 参数，决定此次发送是不是阻塞的，然后再调用 `runtime.chansend` 发送数据，由于传入的 block 参数为非阻塞，所以在不存在接收方或缓冲区空间不足时，当前 Goroutine 都不会阻塞而会直接返回
- 接收过程：由于从 channel 中接收数据可能会返回一个或两个值，返回值数量不同会导致使用函数的不同。分别是 `runtime.selectnbrecv` 和 `runtime.selectnbrecv2` 函数。底层都会调用 `runtime.chanrecv`，也会有一个 block 参数决定此次接收是否非阻塞。

#### 4. select 存在多个 case

- 将所有 case 转换成包含 channel 以及类型等信息的 `runtime.scase` 结构体。

    ```go
    type scase struct {
    	c *hchan              // chan
    	elem unsafe.Pointer   //data element 
    }
    ```

- 调用运行时函数 `runtime.selectgo` 从多个准备就绪的 channel 中选择一个可执行的 `runtime.scase` 结构体

- 通过 for 循环生成一组 if 语句，在语句中判断自己是不是被选中的 case

`runtime.selectgo` 函数的执行过程

- 初始化操作，并决定处理 case 的顺序：轮询顺序 pollOrder 和加锁顺序 lockOrder。通过以下方式确定

    - 轮询顺序：通过 `runtime.fastrandn` 函数引入随机性。可以避免 channel 的饥饿问题，保证公平性
    - 加锁顺序：按照 channel 的地址排序后确定加锁顺序。能够避免发生死锁（所有的 goroutine 进入 selectgo 进行 lockOrder 都是相同顺序，防止不同顺序的 case 进来时锁定 channel 导致死锁）

- 当为 select 语句锁定了所有 channel 之后，就会进入 `runtime.selectgo` 函数的主循环，它会分为 3 个阶段查找或者等待某个 channel 准备就绪

    - 查找是否已经存在准备就绪的 channel，即可以执行收发操作

        循环会遍历所有 case 并找到需要被唤醒的 `runtime.sudog` 结构。会根据 case 的 4 种类型分别处理：

        - 当 case 不包含 channel 时：这种 case 会被跳过
        - 当 case 从 channel 中接收数据时：
            1. 如果当前 channel 的 sendq 发送队列上有等待的 Goroutine，则可以从休眠的发送方获取数据
            2. 如果当前 channel 的缓冲区不为空，就会从缓冲区获取数据
            3. 如果当前 channel 已经关闭，则从关闭的 channel 读取到 EOF
        - 当 case 向 channel 发送数据时：
            1. 如果当前 channel 已经关闭，则触发 panic 尝试中止程序
            2. 如果当前 channel 的 recvq 接收队列上有等待的 Goroutine，则可以向休眠的接收方发送数据
            3. 如果当前 channel 的缓冲区存在空闲位置，就会将待发送的数据存入缓冲区
        - 当 select 语句中包含 default 时：当前面的所有 case 都没有被执行，这里会解锁所有 channel 并返回，意味着当前 select 结构中的收发都是非阻塞的

        没有查找到准备就绪的 channel，则进入下一阶段。

    - 将当前 Goroutine 加入 channel 对应的收发队列并等待被其他 Goroutine 唤醒。除了将当前 Goroutine 对应的 `runtime.sudog` 结构体加入队列外，这些结构体都会被串成链表附着在当前 Goroutine 上，并挂起当前 Goroutine 等待调度器唤醒。

    - 当前 Goroutine 被唤醒之后找到满足条件的 channel 并进行处理，过程如下

        - 遍历全部 case，首先获取当前 Goroutine 接收到的参数 sudog 结构，然后依次对比所有 case 对应的 sudog 结构，找到被唤醒的 case，获取该 case 对应的索引并返回。
        - 剩余 case 中没有用到的 `runtime.sudog` 就会被忽略并释放。为了不影响 channel 的正常使用，会将这些废弃的 `runtime.sudog` 从 channel 中出队