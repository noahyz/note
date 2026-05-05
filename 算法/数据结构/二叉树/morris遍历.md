---
title: 二叉树的 Morris 遍历
---

Morris 遍历细节

假设来到当前节点 cur，开始时 cur 来到头节点位置

1. 如果 cur 没有左孩子，cur 向右移动 （cur = cur.right）
2. 如果 cur 有左孩子，找到左子树上最右的节点 mostRight
   1. 如果 mostRight 的右指针指向空，让其指向 cur，然后 cur 向左移动 （cur = cur.left）
   2. 如果 mostRight 的右指针指向 cur，让其指向 null，然后 cur 向右移动 （cur = cur.right）
3. cur 为空时遍历停止

