## Introduction
Check the hash rate in real time and monitor if the mining device is down.
This plugin is made using Node.

![actiongif](/img/action.gif)

## Requirements
- node
- [DistributionTool](https://developer.elgato.com/documentation/stream-deck/sdk/packaging/)

## Install node modules
```
cd com.ace-software.nicehash.sdPlugin
npm install
```
## Build bundle.js & stream deck plugin
### Build bundle.js
```
npm run build
```
### Build stream deck plugin
```
npm run package
```

## Install plugin
Double click com.ace-software.nicehash.sdPlugin/com.ace-software.nicehash.streamDeckPlugin.

## Plugin setting
![actiongif](/img/setting.png)
| item | note |
| --- | --- |
| NiceHash Host | https://api2.nicehash.com |
| Api Key | NiceHash API Key |
| Api Secret | NiceHash API Secret |
| Org Id | NiceHash Organization ID |
| Rig Id | Optional |
| Max Device Count | Devices that work with rigs. |
| Interval Second | Monitoring interval (seconds) |

---

## NiceHash Status Error
Open http://localhost:23654/ to click com.ace-software.nicehash.
Check MiningSuccess & MiningStatus.

![error](/img/status_error.png)

> https://developer.elgato.com/documentation/stream-deck/sdk/create-your-own-plugin/
> See **Debugging your JavaScript plugin**