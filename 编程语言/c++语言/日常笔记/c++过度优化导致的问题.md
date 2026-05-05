---
title: undefined
date: 2023-01-19 11:11:41
tags:
- linux
---

```
    std::string MetricUtils::EscapeMetricNameAndTag(const std::string& name) {
        if (name.empty() || name.size() > metric::constants::DefaultFieldKeyLengthOfMeasurement) {
            return "";
        }
        std::string output_name(name);
        for (size_t index = 0; index < name.size(); index++) {
            auto x = name[index];
            if (!(x >= '0' && x <= '9') && !(x >= 'A' && x <= 'Z') && !(x >= 'a' && x <= 'z') &&
                x != '.' && x != '-' && x != '_') {
                output_name[index] = '_';
            }
        }
        return output_name;
    }
```

如上的代码，编译器会优化，其中 output_name 这个字符串会被优化成静态的，即不会每次都创建。