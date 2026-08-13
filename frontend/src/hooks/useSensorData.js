/**
 * useSensorData.js — BLE/WiFi Sensor Emulator Hook
 * Online mode: WebSocket placeholder for real MQTT.
 * Offline mode: Gaussian noise random-walk per node.
 */
import { useEffect, useRef } from 'react';
import useKineticStore from './useKineticStore';
import { gaussianRandom } from '../lib/utils';

export function useSensorData() {
  const intervalRef = useRef(null);
  const frameRef = useRef(0);

  const sensorMode = useKineticStore((s) => s.sensorMode);
  const nodes = useKineticStore((s) => s.nodes);
  const expectedCrowd = useKineticStore((s) => s.expectedCrowd);
  const schedulePhase = useKineticStore((s) => s.schedulePhase);
  const nodeCounts = useKineticStore((s) => s.nodeCounts);
  const sensorPacketCount = useKineticStore((s) => s.sensorPacketCount);

  const updateNodeCounts = useKineticStore((s) => s.updateNodeCounts);
  const setCrowd = useKineticStore((s) => s.setCrowd);
  const setSensorMode = useKineticStore((s) => s.setSensorMode);
  const addLog = useKineticStore((s) => s.addLog);

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (sensorMode === 'offline' || nodes.length === 0) return;

    if (sensorMode === 'online') {
      // ONLINE mode: WebSocket placeholder
      addLog('MQTT/WebSocket sensor connection placeholder active', 'sensor');

      // Simulated "live" sensor data with higher variance
      intervalRef.current = setInterval(() => {
        frameRef.current++;
        const numNodes = nodes.length || 1;
        const basePerNode = expectedCrowd / numNodes;
        const counts = {};

        nodes.forEach((node) => {
          const surge = schedulePhase === 'Post-Event Mass Exit' ? 1.4 : 1.0;
          const noise = gaussianRandom(0, basePerNode * 0.12);
          const drift = Math.sin(frameRef.current * 0.15 + node.x * 0.01) * basePerNode * 0.1;
          counts[node.id] = Math.max(0, Math.round(basePerNode * surge + noise + drift));
        });

        updateNodeCounts(counts);

        const totalCrowd = Object.values(counts).reduce((a, b) => a + b, 0);
        setCrowd(totalCrowd);

        if (frameRef.current % 5 === 0) {
          const topNode = Object.entries(counts).sort(([, a], [, b]) => b - a)[0];
          addLog(`[LIVE] Peak: ${topNode?.[0]} → ${topNode?.[1]?.toLocaleString()} persons`, 'sensor');
        }
      }, 3000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [sensorMode, nodes.length, expectedCrowd, schedulePhase]);

  const toggleSensorMode = () => {
    const nextMode = sensorMode === 'offline' ? 'online' : 'offline';
    setSensorMode(nextMode);
    addLog(`Sensor mode: ${nextMode.toUpperCase()}`, nextMode === 'online' ? 'sensor' : 'info');
  };

  return {
    sensorMode,
    nodeCounts,
    sensorPacketCount,
    toggleSensorMode,
    setSensorMode,
  };
}

export default useSensorData;
