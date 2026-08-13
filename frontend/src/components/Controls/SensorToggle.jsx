/**
 * SensorToggle.jsx — Online/Offline Sensor Mode Toggle
 */
import React from 'react';
import { Bluetooth, Wifi } from 'lucide-react';
import { Toggle } from '../UI/Toggle';
import { Badge } from '../UI/Badge';
import { useSensorData } from '../../hooks/useSensorData';

export function SensorToggle({ className = '' }) {
  const { sensorMode, sensorPacketCount, toggleSensorMode } = useSensorData();
  const isOnline = sensorMode === 'online';

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Toggle
          label={isOnline ? 'Live Sensors' : 'Offline Sim'}
          checked={isOnline}
          onChange={toggleSensorMode}
          colorOn="#39FF14"
          colorOff="#FFB800"
        />
        <Badge
          variant={isOnline ? 'success' : 'warning'}
          dot
          pulse={isOnline}
        >
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </Badge>
      </div>

      {isOnline && (
        <div className="flex items-center space-x-2 text-[10px] font-mono text-[#8A7F72]">
          <Wifi className="w-3 h-3 text-[#39FF14]" />
          <span>Packets: <strong className="text-[#F0EBE3]">{sensorPacketCount}</strong></span>
          <Bluetooth className="w-3 h-3 text-[#00F5FF]" />
          <span>BLE Probe Active</span>
        </div>
      )}
    </div>
  );
}

export default SensorToggle;
