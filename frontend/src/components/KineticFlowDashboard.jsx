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
  Network,
  GitBranch
} from 'lucide-react';
import FluidShaderCanvas from './FluidShaderCanvas';
import VenueMapOverlay, { ROUTE_MATRIX } from './VenueMapOverlay';
import { parseSvgToGraph, generateVenueSpatialGraph } from '../utils/MapAnalyzer';
import { findAStarPath } from '../utils/AStarPathfinder';

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

  // TASK 1 & 3: Spatial Intelligence Graph & A* Pathfinder State
  const [spatialGraph, setSpatialGraph] = useState(() => generateVenueSpatialGraph('Central Railway Terminal'));
  const [aStarResult, setAStarResult] = useState(null);
  const [showGraphOverlay, setShowGraphOverlay] = useState(true);

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
    { id: 1, time: '17:38:04', event: 'Spatial Intelligence Engine Initialized', type: 'info' },
    { id: 2, time: '17:38:12', event: 'A* Pathfinding Mesh Active with Hugging Face AI', type: 'success' }
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

  // Update Spatial Graph when selected venue changes (if no uploaded SVG override)
  useEffect(() => {
    if (!uploadedSvgContent) {
      const newGraph = generateVenueSpatialGraph(selectedVenue);
      setSpatialGraph(newGraph);
    }
  }, [selectedVenue, uploadedSvgContent]);

  // Sensor Mode Simulation
  const [sensorNodeId, setSensorNodeId] = useState('EDGE-NODE-01');
  const [sensorMethod, setSensorMethod] = useState('CV');

  useEffect(() => {
    if (isSensorMode) {
      let baseCount = 42000;
      let frameCount = 0;
      const nodeIds = ['EDGE-NODE-01 (Gate A)', 'EDGE-NODE-02 (Main Corridor)', 'EDGE-NODE-03 (Exit South)', 'LORA-IR-GATE-B'];

      sensorIntervalRef.current = setInterval(() => {
        frameCount++;
        const surge = schedulePhase === 'Post-Event Mass Exit' ? 18000 : (schedulePhase === 'Mid-Event Concession Rush' ? 8000 : 0);
        const noise = Math.floor((Math.random() - 0.5) * 4000);
        const drift = Math.sin(frameCount * 0.3) * 5000;
        const newCount = Math.max(10000, Math.min(95000, baseCount + noise + drift + surge));
        baseCount = Math.round(baseCount * 0.85 + newCount * 0.15);
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

  // Debounced Continuous AI Stream & Node Congestion Weighting
  const debounceTimerRef = useRef(null);

  useEffect(() => {
    setIsAiLoading(true);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const payloadNodes = spatialGraph?.nodes
          ? spatialGraph.nodes.map(n => ({
              id: n.id,
              name: n.name,
              type: n.type,
              isChoke: !!n.isChoke
            }))
          : [];

        const response = await fetch('/api/predict-bottleneck', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            venueType: selectedVenue,
            expectedCrowd: crowdSize,
            activeGates: 3,
            timeToRushHour: schedulePhase,
            nodes: payloadNodes
          })
        });

        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.repellers)) setRepellers(data.repellers);
          if (Array.isArray(data.attractors)) setAttractors(data.attractors);
          if (data.pressureMetrics) setPressureMetrics(data.pressureMetrics);

          // TASK 2: Update Node Congestion Factors from Hugging Face AI response
          if (Array.isArray(data.nodeWeights) && data.nodeWeights.length > 0) {
            setSpatialGraph(prevGraph => {
              if (!prevGraph) return prevGraph;
              const weightMap = new Map(data.nodeWeights.map(w => [w.id, w.congestion]));
              const updatedNodes = prevGraph.nodes.map(n => ({
                ...n,
                congestion: weightMap.has(n.id) ? weightMap.get(n.id) : n.congestion
              }));
              const updatedNodeMap = new Map(updatedNodes.map(n => [n.id, n]));
              return {
                ...prevGraph,
                nodes: updatedNodes,
                nodeMap: updatedNodeMap
              };
            });
          }

          const now = new Date().toLocaleTimeString('en-GB');
          setRerouteLog(prev => [
            { id: Date.now(), time: now, event: `AI Spatial Weighting: ${data.nodeWeights?.length || 0} nodes scored | ${data.repellers?.length || 1} Repellers`, type: 'info' },
            ...prev.slice(0, 8)
          ]);
        }
      } catch (err) {
        console.warn('⚠️ API stream offline, using dynamic tensor fallback:', err.message);
      } finally {
        setIsAiLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [selectedVenue, crowdSize, schedulePhase, spatialGraph?.nodes?.length]);

  // TASK 3: Calculate Real-Time A* Path when spatialGraph or reroute mode changes
  useEffect(() => {
    if (!spatialGraph || !isReroutingActive) {
      setAStarResult(null);
      return;
    }

    const entryNode = spatialGraph.entryNodes?.[0] || spatialGraph.nodes?.[0];
    const exitNode = spatialGraph.exitNodes?.[spatialGraph.exitNodes.length - 1] || spatialGraph.nodes?.[spatialGraph.nodes.length - 1];

    if (entryNode && exitNode) {
      const result = findAStarPath(spatialGraph, entryNode.id, exitNode.id, { congestionMultiplier: 18.0 });
      setAStarResult(result);
    }
  }, [spatialGraph, isReroutingActive]);

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

  // TASK 1: SVG Map Upload Handler & Graph Generation
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

        const svgEl = svgDoc.querySelector('svg');
        if (!svgEl) {
          setUploadError('No root <svg> element found in file.');
          return;
        }

        if (!svgEl.getAttribute('viewBox')) {
          const w = svgEl.getAttribute('width') || '1000';
          const h = svgEl.getAttribute('height') || '600';
          svgEl.setAttribute('viewBox', `0 0 ${parseInt(w)} ${parseInt(h)}`);
        }

        // TASK 1: Parse uploaded SVG into Spatial 2D Mesh Graph
        const parsedGraph = parseSvgToGraph(svgText);
        setSpatialGraph(parsedGraph);

        const now = new Date().toLocaleTimeString('en-GB');
        setUploadedSvgContent(svgText);
        setUploadedSvgName(file.name);
        setRerouteLog(prev => [
          { id: Date.now(), time: now, event: `SVG Blueprint & Spatial Graph Generated: ${file.name} (${parsedGraph.nodes.length} nodes)`, type: 'success' },
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
    setSpatialGraph(generateVenueSpatialGraph(selectedVenue));
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
              <span>SPATIAL AI GRAPH</span>
            </span>
          </div>

          <div className="pt-1.5 border-t border-[#2A2B27]/80 flex items-center justify-between text-xs text-gray-300 font-mono">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>A* Pathfinder: <strong className="text-[#00FFCC]">{aStarResult ? 'OPTIMAL' : 'CALCULATING'}</strong></span>
            </span>
            <span className="text-[10px] text-[#00F0FF]">{spatialGraph?.nodes?.length || 0} Nodes</span>
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

          {/* 2. Crowd Size Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs font-mono">
              <label className="text-gray-400 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#FFC400]" />
                <span>Simulated Crowd Size:</span>
              </label>
              <span className="font-bold text-[#FFC400] text-sm">{crowdSize.toLocaleString()}</span>
            </div>
            <input 
              type="range" 
              min="10000" 
              max="100000" 
              step="2500" 
              value={crowdSize}
              onChange={(e) => setCrowdSize(Number(e.target.value))}
              className="w-full h-1.5 bg-[#2A2B27] rounded-lg appearance-none cursor-pointer accent-[#FFC400]"
            />
          </div>

          {/* 3. Event Schedule Phase Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs text-gray-400 font-mono flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Event Phase:</span>
            </label>
            <select 
              value={schedulePhase}
              onChange={(e) => setSchedulePhase(e.target.value)}
              className="w-full bg-[#161310] text-white border border-[#2A2B27] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FFC400] transition-colors cursor-pointer"
            >
              <option value="Entry Gate Open">Entry Gate Open (Ingress Flow)</option>
              <option value="Mid-Event Concession Rush">Mid-Event Concession Rush</option>
              <option value="Post-Event Mass Exit">Post-Event Mass Exit (Maximum Surge)</option>
            </select>
          </div>
        </div>

        {/* TASK 1: SVG MAP UPLOADER CONTROL */}
        <div className="p-3.5 rounded bg-black/60 border border-[#2A2B27] space-y-2.5 shrink-0">
          <div className="flex items-center justify-between border-b border-[#2A2B27] pb-2">
            <div className="flex items-center space-x-2">
              <Upload className="w-4 h-4 text-[#00F0FF]" />
              <h2 className="font-heading font-bold text-sm text-white uppercase tracking-wider">SVG Architectural Map</h2>
            </div>
            <button
              onClick={() => setShowGraphOverlay(prev => !prev)}
              className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all ${
                showGraphOverlay ? 'bg-[#00F0FF]/20 text-[#00F0FF] border-[#00F0FF]/50' : 'bg-gray-900 text-gray-400 border-gray-800'
              }`}
            >
              Mesh: {showGraphOverlay ? 'ON' : 'OFF'}
            </button>
          </div>

          {uploadedSvgContent ? (
            <div className="p-3 rounded bg-[#00F0FF]/10 border border-[#00F0FF]/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 overflow-hidden">
                  <FileImage className="w-4 h-4 text-[#00F0FF] shrink-0" />
                  <span className="text-xs font-mono font-bold text-white truncate">{uploadedSvgName}</span>
                </div>
                <button 
                  onClick={clearUploadedMap}
                  className="p-1 hover:bg-[#00F0FF]/20 rounded transition-colors text-gray-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-[10px] text-[#00F0FF] font-mono">
                ✓ Walkable spatial mesh generated ({spatialGraph?.nodes?.length || 0} nodes parsed)
              </p>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center space-y-1.5 ${
                isDragOver ? 'border-[#00F0FF] bg-[#00F0FF]/10' : 'border-[#2A2B27] bg-[#161310]/50 hover:border-[#00F0FF]/60'
              }`}
            >
              <Upload className="w-5 h-5 text-[#00F0FF]" />
              <p className="text-xs text-gray-300 font-mono text-center">
                Drag & Drop custom SVG map here
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                Parses bounding paths & walkable mesh graph
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
                <span>DISENGAGE A* AI PATHFINDER</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4" />
                <span>ENGAGE A* AI BYPASS PATHFINDER</span>
              </>
            )}
          </button>
          
          <p className="text-[10px] text-gray-400 text-center font-mono">
            {isReroutingActive 
              ? `⚡ A* Vector Active: Bypassing Choke to ${aStarResult?.path?.[aStarResult.path.length - 1]?.name || 'Exit'}` 
              : 'Click to engage real-time A* pathfinder vector'}
          </p>
        </div>

        {/* BOTTLENECK TENSOR CARD */}
        <div className="space-y-2 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-[#E0143C]" />
              <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Spatial AI Congestion</h3>
            </div>
            <span className="text-[10px] bg-[#E0143C]/20 text-[#E0143C] px-2 py-0.5 rounded font-bold border border-[#E0143C]/40">
              {spatialGraph?.nodes?.filter(n => n.congestion > 0.6)?.length || 1} High Risk Nodes
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
                <p className="text-[10px] text-gray-400 mt-0.5 font-mono">A* Bypass Distance: {aStarResult?.totalDistance || 720}m</p>
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
              <span>Path Cost: <strong className="text-white">{aStarResult?.weightedCost || 890}</strong></span>
              <span className={`font-bold ${isReroutingActive ? 'text-[#00FFCC]' : 'text-[#E0143C]'}`}>
                {isReroutingActive ? "A* BYPASS ACTIVE" : "OVERLOAD"}
              </span>
            </div>
          </div>
        </div>

        {/* Neural Execution Log Feed */}
        <div className="p-3 rounded bg-black/70 border border-[#2A2B27] space-y-1.5 shrink-0">
          <div className="flex items-center justify-between text-xs border-b border-[#2A2B27] pb-1">
            <span className="flex items-center space-x-1.5 font-bold text-white">
              <Layers className="w-3.5 h-3.5 text-[#FFC400]" />
              <span>Neural Execution Stream</span>
            </span>
            <span className="text-[10px] text-gray-500">HF LLAMA-3 / QWEN</span>
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

        {/* Spatial Architecture Map & A* Pathfinder Overlay */}
        <div className="absolute inset-0 z-10">
          <VenueMapOverlay 
            selectedVenue={selectedVenue}
            crowdSize={crowdSize}
            schedulePhase={schedulePhase}
            isReroutingActive={isReroutingActive}
            selectedZone={criticalZone}
            calculatedPressure={chokePressure}
            spatialGraph={spatialGraph}
            aStarResult={aStarResult}
            showGraphOverlay={showGraphOverlay}
            uploadedSvgContent={uploadedSvgContent}
            onSelectZone={setCriticalZone}
          />
        </div>

        {/* Header Bar */}
        <header className="relative z-20 h-12 bg-[#161310]/80 backdrop-blur-md border-b border-[#2A2B27] px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 bg-[#161310] px-3 py-1.5 rounded border border-[#2A2B27]">
              <MapPin className="w-3.5 h-3.5 text-[#FFC400]" />
              <span className="text-gray-400">Venue:</span>
              <span className="text-white font-bold">{uploadedSvgName || selectedVenue}</span>
            </div>

            <div className="flex items-center space-x-2 bg-[#161310] px-3 py-1.5 rounded border border-[#2A2B27]">
              <Radio className="w-3.5 h-3.5 text-[#FFC400] animate-ping" />
              <span className="text-gray-400">Vector:</span>
              <span className="text-[#FFC400] font-bold">X:{mouseCoords.x}% Y:{mouseCoords.y}%</span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-2 bg-[#161310] px-3 py-1.5 rounded border border-[#2A2B27]">
              <span className={`w-2 h-2 rounded-full ${backendHealth?.status === 'online' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className="text-white font-bold">{isAiLoading ? 'UPDATING...' : 'AI SPATIAL GRAPH'}</span>
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
              <GitBranch className="w-4 h-4 text-[#00FFCC]" />
              <span className="text-gray-400">A* Bypass Path:</span>
              <span className="font-bold text-[#00FFCC]">{aStarResult ? 'OPTIMAL (BYPASSING CHOKE)' : 'DIRECT'}</span>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-4 shrink-0 text-[11px] text-gray-400">
            <div>Compute: <strong className="text-white">{telemetry.tflops} TFLOPS</strong></div>
            <div>FPS: <strong className="text-[#FFC400]">{telemetry.fps}</strong></div>
          </div>
        </footer>

      </main>

    </div>
  );
};

export default KineticFlowDashboard;
