import si from "systeminformation";

export async function getHostStats() {
  const [cpu, mem, network, disk, processes] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.networkStats(),
    si.fsStats(),
    si.processes(),
  ]);

  return {
    cpu: {
      percent: cpu.currentLoad.toFixed(2),
      cores: cpu.cpus.map(c => ({
        percent: c.load.toFixed(2),
      })),
    },
    memory: {
      total: mem.total,
      used: mem.used,
      free: mem.free,
      percent: ((mem.used / mem.total) * 100).toFixed(2),
    },
    network: network.map(iface => ({
      interface: iface.iface,
      rxBytes: iface.rx_bytes,
      txBytes: iface.tx_bytes,
      rxSec: iface.rx_sec,   // bytes/sec
      txSec: iface.tx_sec,
    })),
    disk: {
      readBytes: disk.rIO_sec,   // reads per sec
      writeBytes: disk.wIO_sec,  // writes per sec
    },
    processes: {
      total: processes.all,
      running: processes.running,
      sleeping: processes.sleeping,
    },
  };
}