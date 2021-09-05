### prometheus client 的使用

如下，基本涵盖了写一个prometheus client 的函数

```go
import (
	"flag"
	"fmt"
	"log"
	"math"
	"math/rand"
	"net/http"
	//"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

var (
	addr              = flag.String("listen-address", ":8080", "The address to listen on for HTTP requests.")
	uniformDomain     = flag.Float64("uniform.domain", 0.0002, "The domain for the uniform distribution.")
	normDomain        = flag.Float64("normal.domain", 0.0002, "The domain for the normal distribution.")
	normMean          = flag.Float64("normal.mean", 0.00001, "The mean for the normal distribution.")
	oscillationPeriod = flag.Duration("oscillation-period", 10*time.Minute, "The duration of the rate oscillation period.")
)

var (

	// 创建 Prometheus 数据 metric，相当于SQL 数据库声明 table
	rpcDurations = prometheus.NewSummaryVec(
		prometheus.SummaryOpts{
			Name:       "rpc_durations_seconds",
			Help:       "RPC latency distributions.",
			Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
		},
		[]string{"service"},
	)

	rpcDurationsHistogram = prometheus.NewHistogram(prometheus.HistogramOpts{
		Name:    "rpc_durations_histogram_seconds",
		Help:    "RPC latency distributions.",
		//Buckets: prometheus.LinearBuckets(*normMean-5**normDomain, .5**normDomain, 20),
		Buckets: []float64{0,20,40,60,80,100},
	})

	rpcDurationsCounter = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "rpc_durations_counter",
			Help: "RPC latency distributions.",
		},
		)
	ourHistogram = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Name: "our_histogram",
		Help: "our histogram",
		Buckets: prometheus.LinearBuckets(10,10,10),
	},
	[]string{"sex", "name", "age"},
	)
	// Objectives 目标用它们各自的绝对误差定义分位数排名估计。如果目标[q] = e，则q报告的值将是q-e和q+e之间某个φ的φ-分位数值。
	// 默认值是空映射，结果是没有分位数的summary。
	ourSummary = prometheus.NewSummaryVec(prometheus.SummaryOpts{
		Name: "our_summary",
		Help: "our summary",
		Objectives: map[float64]float64{0.5: 0.05, 0.9: 0.01, 0.99: 0.001},
	},
	[]string{"school", "professional", "ranking"},
	)
)

func init() {
	// Register the summary and the histogram with Prometheus's default registry.
	// 注册定义好的 metric 相当于执行SQL create table 语句
	prometheus.MustRegister(rpcDurations)
	prometheus.MustRegister(rpcDurationsHistogram)
	prometheus.MustRegister(rpcDurationsCounter)
	prometheus.MustRegister(ourHistogram)
	prometheus.MustRegister(ourSummary)
	// Add Go module build info.
	prometheus.MustRegister(prometheus.NewBuildInfoCollector())
}

func main() {
	flag.Parse()

	start := time.Now()

	oscillationFactor := func() float64 {
		return 2 + math.Sin(math.Sin(2*math.Pi*float64(time.Since(start))/float64(*oscillationPeriod)))
	}

	go func(){
		for {
			ourHistogram.With(prometheus.Labels{"sex":"man", "name":"noahyzhang", "age":"12"}).Observe(rand.Float64()*100)
			ourHistogram.With(prometheus.Labels{"sex":"woman", "name":"zhangyi", "age":"35"}).Observe(rand.Float64()*100)
			ourHistogram.With(prometheus.Labels{"sex":"man", "name":"xiaoyi", "age":"75"}).Observe(rand.Float64()*100)
			time.Sleep(time.Second)
		}
	}()

	go func() {
		for {
			ourSummary.With(prometheus.Labels{"school":"xian", "professional":"tongxin", "ranking":"17"}).Observe(rand.Float64()*90)
			ourSummary.With(prometheus.Labels{"school":"shenzheng", "professional":"nihao", "ranking":"19"}).Observe(rand.Float64()*90)
			ourSummary.With(prometheus.Labels{"school":"xian", "professional":"hello", "ranking":"89"}).Observe(rand.Float64()*90)
			ourSummary.With(prometheus.Labels{"school":"baoji", "professional":"world", "ranking":"7"}).Observe(rand.Float64()*90)
		}
	}()

	// 业务在代码中想插入对时序数据库TSDB 的数据，相当于 SQL insert
	go func() {
		i := 1
		for {
			//rpcDurationsCounter.WithLabelValues(strconv.Itoa(i % 3)).Add(float64(i % 4))
			//rpcDurationsCounter.WithLabelValues("hello").Add(float64(i % 4))
			//rpcDurationsCounter.WithLabelValues("world").Add(float64(i % 4))
			rpcDurationsCounter.Add(float64(i%10))
			time.Sleep(time.Duration(2) * time.Second)
			i += 1
		}
	}()

	// Periodically record some sample latencies for the three services.
	go func() {
		for {
			v := rand.Float64() * *uniformDomain
			rpcDurations.WithLabelValues("uniform").Observe(v)
			time.Sleep(time.Duration(100*oscillationFactor()) * time.Millisecond)
		}
	}()

	go func() {
		for {
			v := (rand.NormFloat64() * *normDomain) + *normMean
			rpcDurations.WithLabelValues("normal").Observe(v)
			// Demonstrate exemplar support with a dummy ID. This
			// would be something like a trace ID in a real
			// application.  Note the necessary type assertion. We
			// already know that rpcDurationsHistogram implements
			// the ExemplarObserver interface and thus don't need to
			// check the outcome of the type assertion.
			rpcDurationsHistogram.(prometheus.ExemplarObserver).ObserveWithExemplar(
				v, prometheus.Labels{"dummyID": fmt.Sprint(rand.Intn(100000))},
			)
			time.Sleep(time.Duration(75*oscillationFactor()) * time.Millisecond)
		}
	}()

	go func() {
		for {
			v := rand.ExpFloat64() / 1e6
			rpcDurations.WithLabelValues("exponential").Observe(v)
			time.Sleep(time.Duration(50*oscillationFactor()) * time.Millisecond)
		}
	}()

	// Expose the registered metrics via HTTP.
	http.Handle("/metrics", promhttp.HandlerFor(
		prometheus.DefaultGatherer,
		promhttp.HandlerOpts{
			// Opt into OpenMetrics to support exemplars.
			EnableOpenMetrics: true,
		},
	))
	log.Fatal(http.ListenAndServe(*addr, nil))
}
```

参考博文：https://skyingzz.github.io/2020/01/19/prometheus-client-go/#%E5%8F%AF%E4%BB%A5%E5%8F%91%E7%8E%B0%EF%BC%8C%E6%9C%89%E5%A4%AA%E5%A4%9A%E9%A1%B9%E4%BA%86