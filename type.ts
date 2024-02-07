export interface fsObject {
    filesystem: string;
    size: number;
    used: number;
    avail: number;
    usePercent: number;
    mountedOn: string;
}

export interface memObject {
    used: number,
    total: number,
    swap: {
        used: number,
        total: number
    }
}

export interface netObjcet {
    rx: number,
    tx: number
}

export interface cpuObject {
    cores: number,
    usage: number
}

export interface periodTime {
    new: number,
    old: number
}