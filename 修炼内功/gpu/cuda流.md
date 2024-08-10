---
title: cuda 流
---

cuda 程序的并行层次主要有两种，一个是核函数内部的并行，一个是核函数外部的并行。核函数外部的并行主要指：

- 核函数计算与数据传输之间的并行
- 主机计算与数据传输之间的并行
- 不同的数据传输（cudaMemcpy 函数中的第 4 个参数）之间的并行
- 核函数计算与主机计算之间的并行
- 不同核函数之间的并行

一个 CUDA 流指的是由主机发出的在一个设备中执行的 CUDA 操作序列（即和 CUDA 有关的操作，如主机与设备之间数据传输和核函数执行）。一个 CUDA 流中各个操作的次序是由主机控制的，按照主机发布的次序执行。然而，来自于两个不同 CUDA 流中的操作不一定按照某个次序执行，而有可能并发或交错的执行。

任何 CUDA 操作都存在于某个 CUDA 流中，没有指定就是在默认流中（default stream）。

```
// CUDA 流的产生与销毁
cudaStream_t stream;
cudaStreamCreate(&stream);
cudaStreamDestroy(stream);
```

为了实现不同 CUDA 流之间的并发，主机向某个 CUDA 流中发布一系列命令之后必须马上获得程序的控制权，不用等待该 CUDA 流中的命令在设备中执行完毕。这样，就可以通过主机产生多个相互独立的 CUDA 流。

为了检查一个 CUDA 流中的所有操作是否都在设备中执行完毕，可以使用如下 CUDA 运行时 API。

```
// cudaStreamSynchronize 会强制阻塞主机，直到 cuda 流 stream 中的所有操作都执行完毕
cudaError_t cudaStreamSynchronize(cudaStream_t stream);

// cudaStreamQuery 不会阻塞主机，只是检查 CUDA 流 stream 中的所有操作是否都执行完毕
// 若执行完毕则返回 cudaSuccess，否则返回 cudaErrorNotReady
cudaError_t cudaStreamQuery(cudaStream_t stream);
```

核函数执行配置中的流参数

```
// 核函数没有使用动态共享内存，而且在默认流中执行
my_kernel<<<N_grid, N_block>>>(函数参数)

// 核函数在默认流中执行，但使用了 N_shared 字节的动态共享内存 
my_kernel<<<N_grid, N_block, N_shared>>>(函数参数)

// 核函数在编号为 stream_id 的 CUDA 流中执行，而且使用了 N_shared 字节的动态共享内存
my_kernel<<<N_grid, N_block, N_shared, stream_id>>>(函数参数)

// 在使用非空流但不使用动态共享内存的情况，必须将 N_shared 设置为零
my_kernel<<<N_grid, N_block, 0, stream_id>>>(函数参数)
```

- N_grid 是网格大小
- N_block 是线程块大小
- N_shared 是核函数中使用的动态共享内存的字节数
- stream_id 是 CUDA 流的编号







































