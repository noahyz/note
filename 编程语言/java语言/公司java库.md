https://km.woa.com/group/2804/articles/show/328826?kmref=search&from_page=1&no=5

这两个步骤其实非常清楚，但是还是经常会遇到问题，主要在于插件用不了。针对插件用不了主要是由于插件没有正常获取，一般来说都是maven造成的，目前遇到过两个原因：

1. 仓库不正确：目前km上的文档都比较老了，当时用的仓库是trm.wsd.com，这个仓库目前已经废弃了，需要改为http://maven.oa.com/nexus/content/groups/wod/，在开发网下使用这个新的仓库可以正常获取到插件.
2. maven版本：这个问题就比较奇葩了，有的同事用的maven版本特别特别老，导致无法获取（至今只遇到过一个，一时半会儿没有为他解决该同事表示非常暴躁），这种情况可以升级下maven版本重新尝试。

公司java库：http://maven.oa.com/nexus/content/groups/wod/