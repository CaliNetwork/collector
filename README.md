# fetchSys

A library to collect StatData from your linux system, SPE ver for bun.sh

# Tech Details

## > Class: Stat

1. Overview

|Methods|returns|
|-|-|
|fs|An array with all your fsStat|
|net|An object with your main network interface's rx and tx, in bytes|
|cpu|An object with your core count and cpuUsage(Aka. CPUload) within 120ms|
|mem|An object with your phy. mem's usage and swaps'|

2. Example

> fs

```
import Stat from "fetchSys";
console.log(await Stat.fs());
```

returns

```
[
    {...},
    {
        "filesystem": "/dev/sda1",
        "size": 877649973248,
        "used": 126548348928,
        "avail": 706444034048,
        "usePercent": 16,
        "mountedOn": "/home"
    },
    {...}
]
```

> net

```
import Stat from "fetchSys";
console.log(await Stat.net());
```

returns

```
{
    "rx": 12983810,
    "tx": 12123
}
```

> cpu

```
import Stat from "fetchSys";
console.log(await Stat.cpu());
```

returns

```
{
    "cores": 8,
    "usage": 81
}
```

> mem

```
import Stat from "fetchSys";
console.log(await Stat.mem());
```

returns

```
{
    "used": 10,
    "total": 100,
    "swap": {
        "used": 0,
        "total": 0
    }
}
```