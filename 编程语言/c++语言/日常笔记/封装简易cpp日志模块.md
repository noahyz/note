---
title: 封装简易cpp日志模块
---

## 封装简易cpp日志模块

封装 cpp 简易的日志，可以在开发一个新项目马上引用进来。如下是一个简单的思路

```c++
#pragma once

#include <iostream>
#include <iomanip>
#include <string>
#include <fstream>
#include <utility>

// 日志级别
enum LogLevel {
    INFO = 0,
    WARNING,
    ERROR,
};

class Logger {
public:
    Logger() = default;
    ~Logger() {
        get_stream() << std::endl << std::flush;
    }
    Logger(const Logger&) = delete;
    Logger& operator=(const Logger&) = delete;
    Logger(Logger&&) = delete;
    Logger& operator=(Logger&&) = delete;

public:
    static std::ostream& start(LogLevel log_level, const int line, const std::string& func) {
        time_t tm;
        time(&tm);
        char time_str[128];
        strftime(time_str, sizeof(time_str), "[%Y-%m-%d %X] ", localtime(&tm));
        return get_stream() << time_str << "func[" << func << "] " << "line[" << line << "] ";
    }

    static std::ostream& get_stream() {
        return file_.is_open() ? file_ : std::cout;
    }

private:
    friend void init_logger(const std::string& filename);

private:
    LogLevel log_level_;
    static std::ofstream file_;
};

std::ofstream Logger::file_;

void init_logger(const std::string& filename) {
    Logger::file_.open(filename.c_str(), std::ofstream::app);
}

#define LOG(log_level) \
    Logger().start(log_level, __LINE__, __FUNCTION__)
```

缺点是每次使用日志，都将创建一个 Logger 的对象，以及释放这个对象。