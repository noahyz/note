---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

##  gin框架

#### 基本操作

```go
func RouteCtroler(r *gin.Engine) {
	/*
		r.GET("/",func(c *gin.Context) {
			c.String(http.StatusOK,"hello world")
		})
	*/

	// API 参数
	/*
		r.GET("/user/:name/*action", func(c *gin.Context) {
			name := c.Param("name")
			action := c.Param("action")
			action = strings.Trim(action,"/")
			c.String(http.StatusOK, name + " is " + action)
		})
	*/

	// URL 参数
	/*
		r.GET("/user", func(c *gin.Context) {
			name := c.DefaultQuery("name","zhangyi")
			c.String(http.StatusOK, fmt.Sprintf("hello %s", name))
		})
	*/

	// 获取 Query 参数
	/*
		r.GET("/users", func(c *gin.Context) {
			name := c.Query("name")
			role := c.DefaultQuery("role","teacher")
			c.String(http.StatusOK, "%s is a %s", name, role)
		})
	*/

	// 获取POST参数
	/*
		r.POST("/form", func(c *gin.Context) {
			username := c.PostForm("username")
			password := c.DefaultPostForm("password","1234")
			c.JSON(http.StatusOK,gin.H{
				"username": username,
				"password": password,
			})
		})
	*/
}

func RouteMapParam(r *gin.Engine) {
	r.POST("/post", func(c *gin.Context) {
		ids := c.QueryMap("names")
		names := c.PostFormMap("names")
		c.JSON(http.StatusOK, gin.H{
			"ids": ids,
			"names": names,
		})
	})
}

// 利用分组路由可以实现权限控制等等等
func GroupRoute(r *gin.Engine) {
	defaultHandler := func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"path": c.FullPath(),
		})
	}
	v1 := r.Group("/v1")
	{
		v1.GET("/posts",defaultHandler)
		v1.GET("/series",defaultHandler)
	}
	v2 := r.Group("/v2")
	{
		v2.GET("/posts",defaultHandler)
		v2.GET("/series",defaultHandler)
	}
}

func main(){
	r := gin.Default()
	//RouteMapParam(r)
	GroupRoute(r)

	r.Run(":8000")
}
```

#### 中间路由

```go
/*
func MiddleWare() gin.HandlerFunc {
	return func(c *gin.Context) {
		t := time.Now()
		fmt.Println("middleWare start")
		// 设置变量到Context的key中，可以通过Get()取
		c.Set("request","middleWare")
		// 执行函数
		c.Next()
		status := c.Writer.Status()
		fmt.Println("middleWare end", status)
		t2 := time.Since(t)
		fmt.Println("time:", t2)
	}
}

func main() {
	r := gin.Default()
	r.Use(MiddleWare())
	{
		r.GET("/ce", func(c *gin.Context) {
			req,_ := c.Get("request")
			fmt.Println("request:", req)
			c.JSON(200, gin.H{
				"request":	req,
			})
		})
	}
	r.Run(":8000")
}
 */

func myTime(c *gin.Context) {
	start := time.Now()
	c.Next()
	since := time.Since(start)
	fmt.Println("程序用时: ", since)
}

func shopIndexHandler(c *gin.Context) {
	time.Sleep(3*time.Second)
}

func shopHomeHandler(c *gin.Context) {
	time.Sleep(2*time.Second)
}

func main(){
	// 1.创建路由
	// 默认使用了2个中间件 logger(), Recovery()
	r := gin.Default()
	r.Use(myTime)
	shoppingGroup := r.Group("/shopping")
	{
		shoppingGroup.GET("/index", shopIndexHandler)
		shoppingGroup.GET("/home", shopHomeHandler)
	}
	r.Run(":8000")
}
```



