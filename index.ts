import { $ } from "bun";
import type { fsObject, periodTime, netObjcet, cpuObject, memObject, osObject } from "./type";
import os from 'os';

class Stat {
    async fs(): Promise<fsObject[]> {
        const data = await $`df -B 1`.text();
        const rows = data.split('\n').slice(1);
        const result: fsObject[] = [];

        for (const row of rows) {
            if (row !== '') {
                const columns = row.trim().split(/\s+/);
                const object: fsObject = {
                    filesystem: columns[0],
                    size: parseInt(columns[2]) + parseInt(columns[3]),
                    used: parseInt(columns[2]),
                    avail: parseInt(columns[3]),
                    usePercent: parseFloat(columns[4]),
                    mountedOn: columns[5],
                };
                result.push(object);
            }
        }
        return result
    }
    async net(): Promise<netObjcet> {
        let result: netObjcet = {
            tx: 0,
            rx: 0
        }
        //Detect default interface
        const data = await $`ip route 2> /dev/null | grep default`.text();
        const match = /dev\s+(\w+)/.exec(data);
        if (match && match[1]) {
            const netInterface: string = match[1]
            result = {
                rx: parseInt(await Bun.file(`/sys/class/net/${netInterface}/statistics/rx_bytes`).text()),
                tx: parseInt(await Bun.file(`/sys/class/net/${netInterface}/statistics/tx_bytes`).text())
            }
        }
        return result
    }
    async cpu(): Promise<cpuObject> {
        let result: cpuObject = {
            cores: 0,
            usage: 0
        }
        let totalTime: periodTime = {
            new: 0,
            old: 0
        };
        let idleTime: periodTime = {
            new: 0,
            old: 0
        };
        //Collect for the first time
        for (const cpu of os.cpus()) {
            totalTime.old += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq
            idleTime.old += cpu.times.idle
        }
        await Bun.sleep(120);
        for (const cpu of os.cpus()) {
            totalTime.new += cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.idle + cpu.times.irq
            idleTime.new += cpu.times.idle
        }
        //Collect cores
        result.cores = os.cpus().length
        const periodTotalTime: number = totalTime.new - totalTime.old;
        const periodIdleTime: number = idleTime.new - idleTime.old;
        result.usage = 100 * (1 - (periodIdleTime / periodTotalTime))
        return result
    }
    async mem(): Promise<memObject> {
        let result: memObject = {
            used: 0,
            total: 0,
            swap: {
                used: 0,
                total: 0
            }
        }
        const dataRaw = await Bun.file('/proc/meminfo').text();
        const rows = dataRaw.split('\n');
        let data: any = {};
        for (const row of rows) {
            if (row !== '') {
                const [key, value] = row.split(':').map(str => str.trim());
                if (key !== undefined && value !== undefined) {
                    data[key] = parseInt(value) * 1024;
                }
            }
        }
        result.total = data.MemTotal;
        result.used = result.total - data.MemAvailable;
        result.swap.total = data.SwapTotal;
        result.swap.used = result.swap.total - data.SwapFree;

        return result
    }
    async os() {
        let result: osObject = {
            os: "Unknown",
            version: 0
        }
        try {
            const dataRaw = await Bun.file('/etc/os-release').text();
            const rows = dataRaw.split('\n');
            let data: any = {};
            for (const row of rows) {
                if (row !== '') {
                    let [key, value] = row.split('=').map(str => str.trim());
                    if (key !== undefined && value !== undefined) {
                        if (value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
                            value = value.slice(1, -1);
                        }
                        data[key] = value
                    }
                }
            }
            result.os = data.NAME;
            result.version = parseInt(data.VERSION_ID)
            return result
        } catch (error) {
            return result
        }
    }
}
export default new Stat