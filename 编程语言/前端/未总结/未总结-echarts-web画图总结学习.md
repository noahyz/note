---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

# 未总结---echarts  web画图总结学习

菜鸟教程

https://www.runoob.com/echarts/echarts-visualmap.html

官网教程

https://echarts.apache.org/zh/tutorial.html#5%20%E5%88%86%E9%92%9F%E4%B8%8A%E6%89%8B%20ECharts

推荐学习官网教程

后面如果有需要，再看看这个 api ，数据组织的形式

dataset 的使用

https://my.oschina.net/u/3298482/blog/2032375

图表的自适应

https://www.cnblogs.com/theWayToAce/p/8194490.html

echarts 数据更新，但是图表没有更新

api 的使用问题

charts.setOption(data,true)

y 轴标签值太长显示问题

https://blog.csdn.net/Dandelion_drq/article/details/79270597

echarts 折线图非节点的点击跳转事件

https://segmentfault.com/a/1190000019550910

echarts 重绘后之前的点击事件仍然触发

清除画布

mychart.clear()

mychart.setOption(option)

在渲染点击事件之前先清除点击事件

mychart.off('click')

mychart.on('click', function(params){create_xianMap()})

%E8%8F%9C%E9%B8%9F%E6%95%99%E7%A8%8B%0Ahttps%3A%2F%2Fwww.runoob.com%2Fecharts%2Fecharts-visualmap.html%0A%0A%E5%AE%98%E7%BD%91%E6%95%99%E7%A8%8B%0Ahttps%3A%2F%2Fecharts.apache.org%2Fzh%2Ftutorial.html%235%2520%25E5%2588%2586%25E9%2592%259F%25E4%25B8%258A%25E6%2589%258B%2520ECharts%0A%0A%E6%8E%A8%E8%8D%90%E5%AD%A6%E4%B9%A0%E5%AE%98%E7%BD%91%E6%95%99%E7%A8%8B%0A%E5%90%8E%E9%9D%A2%E5%A6%82%E6%9E%9C%E6%9C%89%E9%9C%80%E8%A6%81%EF%BC%8C%E5%86%8D%E7%9C%8B%E7%9C%8B%E8%BF%99%E4%B8%AA%20api%20%EF%BC%8C%E6%95%B0%E6%8D%AE%E7%BB%84%E7%BB%87%E7%9A%84%E5%BD%A2%E5%BC%8F%0A%0Adataset%20%E7%9A%84%E4%BD%BF%E7%94%A8%0Ahttps%3A%2F%2Fmy.oschina.net%2Fu%2F3298482%2Fblog%2F2032375%0A%0A%E5%9B%BE%E8%A1%A8%E7%9A%84%E8%87%AA%E9%80%82%E5%BA%94%0Ahttps%3A%2F%2Fwww.cnblogs.com%2FtheWayToAce%2Fp%2F8194490.html%0A%0Aecharts%20%E6%95%B0%E6%8D%AE%E6%9B%B4%E6%96%B0%EF%BC%8C%E4%BD%86%E6%98%AF%E5%9B%BE%E8%A1%A8%E6%B2%A1%E6%9C%89%E6%9B%B4%E6%96%B0%0Aapi%20%E7%9A%84%E4%BD%BF%E7%94%A8%E9%97%AE%E9%A2%98%0Acharts.setOption(data%2Ctrue)%0A%0Ay%20%E8%BD%B4%E6%A0%87%E7%AD%BE%E5%80%BC%E5%A4%AA%E9%95%BF%E6%98%BE%E7%A4%BA%E9%97%AE%E9%A2%98%0Ahttps%3A%2F%2Fblog.csdn.net%2FDandelion_drq%2Farticle%2Fdetails%2F79270597%0A%0Aecharts%20%E6%8A%98%E7%BA%BF%E5%9B%BE%E9%9D%9E%E8%8A%82%E7%82%B9%E7%9A%84%E7%82%B9%E5%87%BB%E8%B7%B3%E8%BD%AC%E4%BA%8B%E4%BB%B6%0Ahttps%3A%2F%2Fsegmentfault.com%2Fa%2F1190000019550910%0A%0Aecharts%20%E9%87%8D%E7%BB%98%E5%90%8E%E4%B9%8B%E5%89%8D%E7%9A%84%E7%82%B9%E5%87%BB%E4%BA%8B%E4%BB%B6%E4%BB%8D%E7%84%B6%E8%A7%A6%E5%8F%91%0A%E6%B8%85%E9%99%A4%E7%94%BB%E5%B8%83%0Amychart.clear()%0Amychart.setOption(option)%0A%E5%9C%A8%E6%B8%B2%E6%9F%93%E7%82%B9%E5%87%BB%E4%BA%8B%E4%BB%B6%E4%B9%8B%E5%89%8D%E5%85%88%E6%B8%85%E9%99%A4%E7%82%B9%E5%87%BB%E4%BA%8B%E4%BB%B6%0Amychart.off('click')%0Amychart.on('click'%2C%20function(params)%7Bcreate_xianMap()%7D)
