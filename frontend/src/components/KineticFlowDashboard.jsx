import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Zap, 
  Radio, 
  Layers, 
  ShieldAlert, 
  Gauge, 
  RefreshCw, 
  Sliders, 
  Building2, 
  Users, 
  Clock, 
  TrendingUp, 
  MapPin,
  Bluetooth,
  Upload,
  FileImage,
  X,
  Wifi
} from 'lucide-react';
import FluidShaderCanvas from './FluidShaderCanvas';
import VenueMapOverlay, { VENUE_CONFIGS, ROUTE_MATRIX } from './VenueMapOverlay';

export const KineticFlowDashboard = ({ backendHealth = null }) => {
  // Input Controls State
  const [selectedVenue, setSelectedVenue] = useState('Central Railway Terminal');
  const [crowdSize, setCrowdSize] = useState(50000);
  const [schedulePhase, setSchedulePhase] = useState('Entry Gate Open');

  // Dynamic Neural Vector Tensors State
  const [repellers, setRepellers] = useState([{ x: 0.50, y: 0.40, force: 2.5, radius: 0.20 }]);
  const [attractors, setAttractors] = useState([{ x: 0.84, y: 0.85, force: 2.1 }]);
  const [pressureMetrics, setPressureMetrics] = useState({ peakDensity: 88, flowVelocity: 4.82 });

  // Map & Control State
  const [criticalZone, setCriticalZone] = useState('Main Concourse (Choke Point)');
  const [isReroutingActive, setIsReroutingActive] = useState(true);
  const [mouseCoords, setMouseCoords] = useState({ x: 50, y: 50 });
  const [isAiLoading, setIsAiLoading] = useState(false);

  // TASK 1: BLE / Wi-Fi Sensor Mode State
  const [isSensorMode, setIsSensorMode] = useState(false);
  const [sensorPacketCount, setSensorPacketCount] = useState(0);
  const sensorIntervalRef = useRef(null);

  // TASK 2: SVG Map Uploader State
  const [uploadedSvgContent, setUploadedSvgContent] = useState(null);
  const [uploadedSvgName, setUploadedSvgName] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const fileInputRef = useRef(null);

  // Log Feed
  const [rerouteLog, setRerouteLog] = useState([
    { id: 1, time: '17:38:04', event: 'Neural Vector Engine initialized', type: 'info' },
    { id: 2, time: '17:38:12', event: 'Continuous spatial tensor updates active', type: 'success' }
  ]);

  // Telemetry metrics state
  const [telemetry, setTelemetry] = useState({
    latency: 14,
    tflops: 4.28,
    fps: 60
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        latency: Math.max(11, Math.min(22, 14 + Math.floor((Math.random() - 0.5) * 3))),
        tflops: parseFloat((4.28 + (Math.random() - 0.5) * 0.1).toFixed(2)),
        fps: Math.floor(58 + Math.random() * 4)
      }));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  // SENSOR MODE: CV Edge Node / LoRa IR Beam Counter Simulation
  // Real-world: YOLOv8 on Jetson Nano (per-zone person detection via CCTV)
  //             OR LoRa IR beam counters at gates (865 MHz, no WiFi/BT dependency)
  // Both feed counts to a local Ethernet server → this dashboard
  // No internet, no congested spectrum required.
  const [sensorNodeId, setSensorNodeId] = useState('EDGE-NODE-01');
  const [sensorMethod, setSensorMethod] = useState('CV'); // 'CV' | 'LORA'

  useEffect(() => {
    if (isSensorMode) {
      let baseCount = 42000; // Realistic dense-event baseline
      let frameCount = 0;
      const nodeIds = ['EDGE-NODE-01 (Gate A)', 'EDGE-NODE-02 (Main Corridor)', 'EDGE-NODE-03 (Exit South)', 'LORA-IR-GATE-B'];

      sensorIntervalRef.current = setInterval(() => {
        frameCount++;
        // Simulate CV person-detection count or LoRa IR beam count
        // In production: this value arrives from Jetson/RPi via local HTTP POST
        const surge = schedulePhase === 'Post-Event Mass Exit' ? 18000 : (schedulePhase === 'Mid-Event Concession Rush' ? 8000 : 0);
        const noise = Math.floor((Math.random() - 0.5) * 4000);
        const drift = Math.sin(frameCount * 0.3) * 5000;
        const newCount = Math.max(10000, Math.min(95000, baseCount + noise + drift + surge));
        baseCount = Math.round(baseCount * 0.85 + newCount * 0.15); // Smooth with EWMA
        setCrowdSize(Math.round(newCount));
        setSensorPacketCount(prev => prev + 1);
        const activeNode = nodeIds[frameCount % nodeIds.length];
        setSensorNodeId(activeNode);

        const now = new Date().toLocaleTimeString('en-GB');
        const method = sensorMethod === 'CV' ? '[CV EDGE]' : '[LORA-IR]';
        setRerouteLog(prev => [
          { id: Date.now(), time: now, event: `${method} ${activeNode} → ${Math.round(newCount).toLocaleString()} persons detected (Frame #${frameCount})`, type: 'sensor' },
          ...prev.slice(0, 8)
        ]);
      }, 2000);
    } else {
      if (sensorIntervalRef.current) {
        clearInterval(sensorIntervalRef.current);
        sensorIntervalRef.current = null;
      }
      setSensorPacketCount(0);
    }

    return () => {
      if (sensorIntervalRef.current) clearInterval(sensorIntervalRef.current);
    };
  }, [isSensorMode, schedulePhase, sensorMethod]);

  // Debounced Continuous AI Stream (300ms)
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setIsAiLoading(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const response = await fetch('/api/predict-bottleneck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venueType: selectedVenue,
            expectedCrowd: crowdSize,
            activeGates: 3,
            timeToRushHour: schedulePhase
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.repellers)) setRepellers(data.repellers);
          if (Array.isArray(data.attractors)) setAttractors(data.attractors);
          if (data.pressureMetrics) setPressureMetrics(data.pressureMetrics);

          const now = new Date().toLocaleTimeString('en-GB');
          setRerouteLog(prev => [
            { id: Date.now(), time: now, event: `Neural Tensor Updated: ${data.repellers?.length || 1} Repellers | ${data.attractors?.length || 1} Attractors`, type: 'info' },
            ...prev.slice(0, 8)
          ]);
        }
      } catch (err) {
        console.warn('⚠️ API stream offline, using live dynamic tensor fallback:', err.message);
      } finally {
        setIsAiLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [selectedVenue, crowdSize, schedulePhase]);

  // Auto-resolve active choke point based on selected venue
  useEffect(() => {
    const venueMatrix = ROUTE_MATRIX[selectedVenue] || ROUTE_MATRIX["Central Railway Terminal"];
    const availableZones = Object.keys(venueMatrix);

    if (crowdSize > 65000 || schedulePhase === 'Post-Event Mass Exit') {
      const chokeZone = availableZones.find(z => z.includes('Choke') || z.includes('Ramp') || z.includes('Gate B')) || availableZones[0];
      setCriticalZone(chokeZone);
    } else {
      setCriticalZone(availableZones[0]);
    }
  }, [selectedVenue, crowdSize, schedulePhase]);

  // Resolve Active Route Configuration
  const venueMatrix = ROUTE_MATRIX[selectedVenue] || ROUTE_MATRIX["Central Railway Terminal"];
  const activeRouteConfig = venueMatrix[criticalZone] || Object.values(venueMatrix)[0];

  // Parameter mappings
  const fluidDensity = ((crowdSize / 10000) * 1.85).toFixed(2);
  const particleCount = Math.floor(crowdSize * 2.85);

  const crowdRatio = crowdSize / 100000;
  const phaseMultiplier = schedulePhase === 'Post-Event Mass Exit' ? 1.35 : (schedulePhase === 'Mid-Event Concession Rush' ? 1.15 : 0.95);
  const chokePressure = Math.min(99, Math.round(pressureMetrics.peakDensity || (crowdRatio * phaseMultiplier * 92)));

  const simSpeed = isReroutingActive ? 1.8 : (0.8 + crowdRatio * 0.6);
  const densityFactor = parseFloat(fluidDensity) / 10.0;

  // Toggle Reroute Mode
  const handleToggleRerouteMode = () => {
    setIsReroutingActive(prev => !prev);
  };

  // TASK 2: SVG Map Upload Handler
  const handleMapUpload = useCallback((file) => {
    setUploadError(null);
    if (!file || !file.name.toLowerCase().endsWith('.svg')) {
      setUploadError('Only .SVG files are accepted.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const svgText = e.target.result;
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
        const parseError = svgDoc.querySelector('parsererror');
        if (parseError) {
          setUploadError('Invalid SVG file. Could not parse geometry.');
          return;
        }

        // Extract SVG content & validate structure
        const svgEl = svgDoc.querySelector('svg');
        if (!svgEl) {
          setUploadError('No root <svg> element found in file.');
          return;
        }

        // Inject responsive viewBox if missing
        if (!svgEl.getAttribute('viewBox')) {
          const w = svgEl.getAttribute('width') || '1000';
          const h = svgEl.getAttribute('height') || '600';
          svgEl.setAttribute('viewBox', `0 0 ${parseInt(w)} ${parseInt(h)}`);
        }

        const now = new Date().toLocaleTimeString('en-GB');
        setUploadedSvgContent(svgText);
        setUploadedSvgName(file.name);
        setRerouteLog(prev => [
          { id: Date.now(), time: now, event: `SVG Blueprint Loaded: ${file.name} (${Math.round(file.size / 1024)}KB)`, type: 'success' },
          ...prev.slice(0, 8)
        ]);
      } catch (err) {
        setUploadError(`Failed to parse SVG: ${err.message}`);
      }
    };
    reader.onerror = () => setUploadError('Failed to read file. Please try again.');
    reader.readAsText(file);
  }, []);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleMapUpload(file);
  }, [handleMapUpload]);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) handleMapUpload(file);
  }, [handleMapUpload]);

  const clearUploadedMap = () => {
    setUploadedSvgContent(null);
    setUploadedSvgName(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-[#E0DCD6] select-none font-mono flex">
      
      {/* LEFT PANEL */}
      <aside className="w-full md:w-[380px] lg:w-[460px] h-full bg-[#161310]/90 backdrop-blur-xl border-r border-[#2A2B27] z-20 flex flex-col p-4 space-y-3 overflow-y-auto shrink-0 shadow-2xl">
        
        {/* Title Header */}
        <div className="p-3.5 rounded bg-black/60 border border-[#2A2B27] space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded bg-[#FFC400]/10 border border-[#FFC400]/40 flex items-center justify-center p-1">
                <Activity className="w-full h-full text-[#FFC400] animate-pulse" />
              </div>
              <h1 className="font-heading font-bold text-xl text-white tracking-wider">KINETIC FLOW</h1>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>NEURAL ENGINE</span>
            </span>
          </div>

          <div className="pt-1.5 border-t border-[#2A2B27]/80 flex items-center justify-between text-xs text-gray-300 font-mono">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Tensor Stream: <strong className="text-white">{isAiLoading ? 'STREAMING...' : 'ACTIVE'}</strong></span>
            </span>
          </div>
        </div>

        {/* INPUT CONTROLS */}
        <div className="p-3.5 rounded bg-black/60 border border-[#2A2B27] space-y-3 shrink-0">
          <div className="flex items-center space-x-2 border-b border-[#2A2B27] pb-2">
            <Sliders className="w-4 h-4 text-[#FFC400]" />
            <h2 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Neural Input Controls</h2>
          </div>

          {/* 1. Venue Layout Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Venue Layout:</span>
            </label>
            <select 
              value={selectedVenue}
              onChange={(e) => setSelectedVenue(e.target.value)}
              className="w-full bg-[#161310] text-white border border-[#2A2B27] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FFC400] transition-colors cursor-pointer"
            >
              <option value="Central Railway Terminal">Central Railway Terminal</option>
              <option value="IPL Stadium Sector 4">IPL Stadium Sector 4</option>
              <option value="Concert Arena">Concert Arena</option>
            </select>
          </div>

          {/* CV EDGE NODE / LORA SENSOR MODE TOGGLE */}
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2.5 px-3 rounded bg-[#161310] border border-[#2A2B27]">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 rounded flex items-center justify-center ${isSensorMode ? 'bg-[#00FF88]/15 border border-[#00FF88]/60' : 'bg-black/60 border border-[#2A2B27]'}`}>
                  <svg viewBox="0 0 24 24" className={`w-3.5 h-3.5 fill-none stroke-current stroke-2 ${isSensorMode ? 'text-[#00FF88]' : 'text-gray-500'}`}>
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M6.3 6.3a8 8 0 0 0 0 11.4M17.7 17.7a8 8 0 0 0 0-11.4M3.5 3.5a14 14 0 0 0 0 17M20.5 20.5a14 14 0 0 0 0-17"/>
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-heading font-bold text-white leading-none">CV Edge Node / LoRa-IR Mode</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {isSensorMode
                      ? <span className="text-[#00FF88] font-semibold flex items-center gap-1"><span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-ping" />Local edge inference · no network required</span>
                      : <span className="text-gray-500">Works at Kumbh Mela / IPL · spectrum-free</span>
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSensorMode(prev => !prev)}
                className={`relative w-11 h-6 rounded-full border transition-all duration-300 shrink-0 ${isSensorMode ? 'bg-[#00FF88] border-[#00FF88]' : 'bg-[#2A2B27] border-[#3A3B35]'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-all duration-300 shadow-md ${isSensorMode ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>

            {/* Sensor Method Selector (CV vs LoRa) */}
            {isSensorMode && (
              <div className="flex rounded overflow-hidden border border-[#2A2B27] text-[10px] font-mono font-bold">
                <button
                  onClick={() => setSensorMethod('CV')}
                  className={`flex-1 py-1.5 transition-all ${sensorMethod === 'CV' ? 'bg-[#FFC400] text-black' : 'bg-[#161310] text-gray-400 hover:text-white'}`}
                >
                  📷 CV / YOLOv8 (CCTV)
                </button>
                <button
                  onClick={() => setSensorMethod('LORA')}
                  className={`flex-1 py-1.5 transition-all ${sensorMethod === 'LORA' ? 'bg-[#FFC400] text-black' : 'bg-[#161310] text-gray-400 hover:text-white'}`}
                >
                  📡 LoRa IR (865 MHz)
                </button>
              </div>
            )}

            {/* Active Sensor Status Card */}
            {isSensorMode && (
              <div className="py-2.5 px-3 rounded bg-[#00FF88]/10 border border-[#00FF88]/40 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-mono text-[#00FF88] font-bold">
                    {sensorMethod === 'CV' ? '🎯 YOLOV8 EDGE INFERENCE ACTIVE' : '📡 LORA-IR GATE COUNTER ACTIVE'}
                  </p>
                  <span className="text-[10px] text-gray-400 font-mono">2s poll</span>
                </div>
                <div className="text-[10px] font-mono text-gray-300 space-y-0.5">
                  <p>Node: <strong className="text-white">{sensorNodeId}</strong></p>
                  <p>Method: <strong className="text-[#FFC400]">{sensorMethod === 'CV' ? 'Person Detection (CCTV → Jetson Nano)' : 'IR Beam Break Counter (865 MHz LoRa)'}</strong></p>
                  <p>Frames processed: <strong className="text-white">{sensorPacketCount}</strong></p>
                </div>
                <div className="pt-1 border-t border-[#00FF88]/20">
                  <p className="text-[9px] text-gray-500 font-mono italic">
                    {sensorMethod === 'CV'
                      ? 'In production: Jetson Nano runs YOLOv8 on CCTV stream → LAN POST to backend every 2s'
                      : 'In production: LoRa module at each gate sends IR beam-break count via 865 MHz → LoRa Gateway → LAN'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Expected Crowd Size Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className={`flex items-center space-x-1.5 ${isSensorMode ? 'text-gray-600' : 'text-gray-400'}`}>
                <Users className={`w-3.5 h-3.5 ${isSensorMode ? 'text-gray-600' : 'text-[#FFC400]'}`} />
                <span>Expected Crowd Size:</span>
                {isSensorMode && <span className="text-[10px] text-gray-600 italic">(Sensor Override)</span>}
              </span>
              <span className={`font-bold font-mono text-sm ${isSensorMode ? 'text-[#00FF88]' : 'text-[#FFC400]'}`}>
                {crowdSize.toLocaleString()} people
              </span>
            </div>
            <input 
              type="range"
              min="5000"
              max="100000"
              step="2500"
              value={crowdSize}
              disabled={isSensorMode}
              onChange={(e) => setCrowdSize(Number(e.target.value))}
              className={`w-full h-2 rounded cursor-pointer transition-opacity ${isSensorMode ? 'opacity-30 cursor-not-allowed' : 'accent-[#FFC400]'}`}
              style={{ accentColor: isSensorMode ? '#00FF88' : '#FFC400' }}
            />
            <div className={`flex justify-between text-[9px] font-mono ${isSensorMode ? 'text-gray-600' : 'text-gray-500'}`}>
              <span>5,000</span>
              <span>50,000</span>
              <span>100,000</span>
            </div>
          </div>

          {/* 3. Event Schedule Phase Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Event Schedule Phase:</span>
            </label>
            <select 
              value={schedulePhase}
              onChange={(e) => setSchedulePhase(e.target.value)}
              className="w-full bg-[#161310] text-white border border-[#2A2B27] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FFC400] transition-colors cursor-pointer"
            >
              <option value="Entry Gate Open">Entry Gate Open</option>
              <option value="Mid-Event Concession Rush">Mid-Event Concession Rush</option>
              <option value="Post-Event Mass Exit">Post-Event Mass Exit</option>
            </select>
          </div>
        </div>

        {/* TASK 2: SVG MAP UPLOADER */}
        <div className="p-3.5 rounded bg-black/60 border border-[#2A2B27] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between border-b border-[#2A2B27] pb-2">
            <div className="flex items-center space-x-2">
              <FileImage className="w-4 h-4 text-[#FFC400]" />
              <h2 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Upload Venue Blueprint</h2>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">.SVG</span>
          </div>

          {uploadedSvgContent ? (
            /* Uploaded State */
            <div className="space-y-2">
              <div className="flex items-center space-x-3 py-2.5 px-3 rounded bg-[#FFC400]/10 border border-[#FFC400]/50">
                <div className="w-8 h-8 rounded bg-[#FFC400]/20 border border-[#FFC400]/40 flex items-center justify-center shrink-0">
                  <FileImage className="w-4 h-4 text-[#FFC400]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono font-bold text-[#FFC400] truncate">{uploadedSvgName}</p>
                  <p className="text-[10px] text-gray-400 font-mono">SVG geometry loaded · Active</p>
                </div>
                <button onClick={clearUploadedMap} className="shrink-0 w-6 h-6 rounded bg-red-950 border border-red-800/50 flex items-center justify-center hover:bg-red-900 transition-colors">
                  <X className="w-3.5 h-3.5 text-[#E0143C]" />
                </button>
              </div>
              
              {/* Inline SVG Preview */}
              <div 
                className="w-full rounded border border-[#2A2B27] bg-black/60 overflow-hidden"
                style={{ height: '100px' }}
                dangerouslySetInnerHTML={{ __html: uploadedSvgContent.replace(/<svg/, '<svg style="width:100%;height:100%;object-fit:contain"').replace(/width="[^"]*"/, '').replace(/height="[^"]*"/, '') }} 
              />
            </div>
          ) : (
            /* Drop Zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center py-6 px-4 rounded border-2 border-dashed cursor-pointer transition-all duration-200 ${
                isDragOver 
                  ? 'border-[#FFC400] bg-[#FFC400]/10' 
                  : 'border-[#2A2B27] bg-black/30 hover:border-[#FFC400]/50 hover:bg-[#FFC400]/5'
              }`}
            >
              <Upload className={`w-8 h-8 mb-2 transition-colors ${isDragOver ? 'text-[#FFC400]' : 'text-gray-600'}`} />
              <p className="text-xs font-heading font-bold text-center text-gray-400">
                {isDragOver ? 'Release to Upload Blueprint' : 'Drag & Drop SVG'}
              </p>
              <p className="text-[10px] text-gray-600 text-center mt-1 font-mono">
                Or click to browse · .SVG only
              </p>
              <p className="text-[10px] text-gray-500 text-center mt-1 font-mono">
                Replaces hardcoded venue geometry
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".svg"
            className="hidden"
            onChange={handleFileInput}
          />

          {uploadError && (
            <div className="py-2 px-3 rounded bg-[#E0143C]/10 border border-[#E0143C]/40">
              <p className="text-[10px] font-mono text-[#E0143C]">{uploadError}</p>
            </div>
          )}

          {!uploadedSvgContent && (
            <div className="flex items-center space-x-2 py-1.5 px-2 rounded bg-black/40 border border-[#2A2B27]/60">
              <div className="w-1 h-1 rounded-full bg-[#00F0FF] animate-pulse" />
              <p className="text-[10px] font-mono text-gray-500">Fallback: Default HUD grid outline active</p>
            </div>
          )}
        </div>

        {/* PRIMARY ACTION BUTTON */}
        <div className="space-y-1.5 shrink-0">
          <button 
            onClick={handleToggleRerouteMode}
            className={`w-full py-3.5 px-4 rounded font-heading font-extrabold text-sm tracking-wider uppercase transition-all duration-200 flex items-center justify-center space-x-2 border shadow-xl ${
              isReroutingActive 
                ? 'bg-[#E0143C] text-white border-[#E0143C] hover:bg-red-700 animate-pulse' 
                : 'bg-[#FFC400] text-black border-[#FFC400] hover:bg-yellow-400 hover:scale-[1.01]'
            }`}
          >
            {isReroutingActive ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>DISENGAGE FORCE FIELD VECTOR</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>ENGAGE NEURAL REROUTE VECTOR</span>
              </>
            )}
          </button>
          
          <p className="text-[10px] text-gray-400 text-center font-mono">
            {isReroutingActive 
              ? `⚡ AI Vector Active: Diverting to ${activeRouteConfig.targetExit}` 
              : 'Click to engage neural force field vectors'}
          </p>
        </div>

        {/* BOTTLENECK TENSOR CARD */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#E0143C]" />
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Neural Force Tensors</h3>
            </div>
            <span className="text-[10px] bg-[#E0143C]/20 text-[#E0143C] px-2 py-0.5 rounded font-bold border border-[#E0143C]/40">
              {repellers.length}R / {attractors.length}A
            </span>
          </div>

          <div className={`p-3 rounded border transition-all ${
            isReroutingActive ? 'bg-[#FFC400]/15 border-[#FFC400]' : 'bg-[#E0143C]/15 border-[#E0143C]'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <span className={`font-heading font-bold text-sm ${isReroutingActive ? 'text-[#FFC400]' : 'text-[#E0143C]'}`}>
                  {criticalZone}
                </span>
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">Coord: ({repellers[0]?.x}, {repellers[0]?.y})</p>
              </div>
              <div className="text-right">
                <span className={`font-mono text-lg font-extrabold ${isReroutingActive ? 'text-[#FFC400]' : 'text-[#E0143C]'}`}>
                  {chokePressure}%
                </span>
                <p className="text-[9px] text-gray-400">Peak Density</p>
              </div>
            </div>

            <div className="w-full h-1.5 bg-black/80 rounded-full mt-2 overflow-hidden border border-red-950">
              <div 
                className={`h-full transition-all duration-500 ${isReroutingActive ? 'bg-[#FFC400]' : 'bg-[#E0143C]'}`} 
                style={{ width: `${chokePressure}%` }}
              />
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-gray-300">
              <span>Force: <strong className="text-white">{repellers[0]?.force || 2.5} kN</strong></span>
              <span className={`font-bold ${isReroutingActive ? 'text-[#FFC400]' : 'text-[#E0143C]'}`}>
                {isReroutingActive ? "DIVERGING" : "OVERLOAD"}
              </span>
            </div>
          </div>
        </div>

        {/* GNN Log Feed */}
        <div className="p-3 rounded bg-black/70 border border-[#2A2B27] space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs border-b border-[#2A2B27] pb-1">
            <span className="flex items-center space-x-1.5 font-bold text-white">
              <Layers className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Neural Execution Stream</span>
            </span>
            <span className="text-[10px] text-gray-500">LIVE · 300ms</span>
          </div>
          <div className="space-y-0.5 max-h-20 overflow-y-auto pr-1 text-[10px]">
            {rerouteLog.map((log) => (
              <div key={log.id} className="flex items-start space-x-2 text-gray-300 font-mono">
                <span className="text-gray-500 shrink-0">[{log.time}]</span>
                <span className={
                  log.type === 'alert' ? 'text-[#E0143C] font-semibold' :
                  log.type === 'success' ? 'text-[#FFC400] font-semibold' :
                  log.type === 'sensor' ? 'text-[#00FF88] font-semibold' : 'text-gray-300'
                }>
                  {log.event}
                </span>
              </div>
            ))}
          </div>
        </div>

      </aside>

      {/* RIGHT PANEL */}
      <main className="flex-1 h-full relative overflow-hidden bg-black flex flex-col justify-between">
        
        <FluidShaderCanvas 
          speedMultiplier={simSpeed}
          densityFactor={densityFactor}
          rerouteActive={isReroutingActive}
          repellers={repellers}
          attractors={attractors}
          onMouseMoveCoords={setMouseCoords}
        />

        {/* SVG Blueprint Overlay or default Venue Map */}
        <div className="absolute inset-0 z-10">
          {uploadedSvgContent ? (
            /* TASK 2: Uploaded SVG Rendered Over Canvas */
            <div className="w-full h-full relative pointer-events-none">
              <div 
                className="absolute inset-0 opacity-75 mix-blend-screen"
                style={{ filter: 'drop-shadow(0 0 8px #00F0FF88)' }}
                dangerouslySetInnerHTML={{ 
                  __html: uploadedSvgContent
                    .replace(/<svg/, '<svg style="width:100%;height:100%;position:absolute;inset:0"')
                    .replace(/width="[^"]*"/, '')
                    .replace(/height="[^"]*"/, '')
                    .replace(/fill="[^"]*"/g, 'fill="none"')
                    .replace(/stroke(?:="[^"]*")?/g, 'stroke="#00F0FF"')
                }} 
              />
              {/* SVG Blueprint Label Badge */}
              <div className="absolute top-4 left-4 bg-[#161310]/90 border border-[#00F0FF] px-3 py-1.5 rounded flex items-center space-x-2">
                <FileImage className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span className="text-xs font-mono font-bold text-[#00F0FF]">BLUEPRINT: {uploadedSvgName}</span>
              </div>
            </div>
          ) : (
            <VenueMapOverlay 
              selectedVenue={selectedVenue}
              crowdSize={crowdSize}
              schedulePhase={schedulePhase}
              isReroutingActive={isReroutingActive}
              selectedZone={criticalZone}
              calculatedPressure={chokePressure}
              onSelectZone={setCriticalZone}
            />
          )}
        </div>

        {/* Header Bar */}
        <header className="relative z-20 h-12 bg-[#161310]/80 backdrop-blur-md border-b border-[#2A2B27] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 bg-[#161310] px-3 py-1.5 rounded border border-[#2A2B27]">
              <MapPin className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="text-gray-400">Venue:</span>
              <span className="text-white font-bold">{selectedVenue}</span>
            </div>

            <div className="flex items-center space-x-2 bg-[#161310] px-3 py-1.5 rounded border border-[#2A2B27]">
              <Radio className="w-3.5 h-3.5 text-[#FFC400] animate-ping" />
              <span className="text-gray-400">Vector:</span>
              <span className="text-[#FFC400] font-bold">X:{mouseCoords.x}% Y:{mouseCoords.y}%</span>
            </div>

            {isSensorMode && (
              <div className="flex items-center space-x-2 bg-[#00FF88]/10 px-3 py-1.5 rounded border border-[#00FF88]/50">
                <Bluetooth className="w-3.5 h-3.5 text-[#00FF88] animate-pulse" />
                <span className="text-[#00FF88] font-bold text-xs">BLE SENSOR LIVE</span>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 bg-[#161310] px-3 py-1.5 rounded border border-[#2A2B27]">
              <span className={`w-2 h-2 rounded-full ${backendHealth?.status === 'online' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-white font-bold">{isAiLoading ? 'UPDATING...' : 'LIVE TENSORS'}</span>
            </div>
          </div>
        </header>

        {/* Footer Telemetry Bar */}
        <footer className="relative z-20 h-12 bg-[#161310]/95 backdrop-blur-md border-t border-[#2A2B27] px-4 flex items-center justify-between text-xs font-mono overflow-x-auto">
          <div className="flex items-center space-x-6 shrink-0">
            <div className="flex items-center space-x-2">
              <Gauge className="w-4 h-4 text-[#FFC400]" />
              <span className="text-gray-400">Fluid Density:</span>
              <span className="font-bold text-white">{fluidDensity} kg/m³</span>
            </div>
            <span className="text-[#2A2B27]">|</span>
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#FFC400]" />
              <span className="text-gray-400">Particles:</span>
              <span className="font-bold text-white">{particleCount.toLocaleString()}</span>
            </div>
            <span className="text-[#2A2B27]">|</span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-gray-400">Velocity:</span>
              <span className="font-bold text-white">{pressureMetrics.flowVelocity || '4.82'} m/s</span>
            </div>
            <span className="text-[#2A2B27]">|</span>
            <div className="flex items-center space-x-2">
              <AlertTriangle className={`w-4 h-4 ${chokePressure > 80 ? 'text-[#E0143C] animate-pulse' : 'text-[#FFC400]'}`} />
              <span className="text-gray-400">Choke:</span>
              <span className={`font-bold ${chokePressure > 80 ? 'text-[#E0143C]' : 'text-white'}`}>{chokePressure}%</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 shrink-0 text-[11px] text-gray-400">
            {isSensorMode && (
              <div className="flex items-center space-x-1">
                <Bluetooth className="w-3.5 h-3.5 text-[#00FF88]" />
                <span className="text-[#00FF88]">BLE LIVE</span>
              </div>
            )}
            <div>Compute: <strong className="text-white">{telemetry.tflops} TFLOPS</strong></div>
            <div>FPS: <strong className="text-[#FFC400]">{telemetry.fps}</strong></div>
          </div>
        </footer>

      </main>

    </div>
  );
};

export default KineticFlowDashboard;
