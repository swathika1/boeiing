import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { jsPDF } from 'jspdf';
import {
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
  FileText,
  Download,
  X,
  ChevronRight,
  Plane,
  Radio,
} from 'lucide-react';

// Aircraft models catalog
const AIRCRAFT_MODELS = [
  { id: 'b737', name: 'Boeing 737', icon: '✈️', color: '#1e40af', range: '3550 nm' },
  { id: 'b747', name: 'Boeing 747', icon: '🛩️', color: '#0369a1', range: '7670 nm' },
  { id: 'b787', name: 'Boeing 787', icon: '✈️', color: '#0d47a1', range: '7305 nm' },
  { id: 'a380', name: 'Airbus A380', icon: '🛫', color: '#1a1a2e', range: '8000 nm' },
  { id: 'a350', name: 'Airbus A350', icon: '✈️', color: '#16213e', range: '8000 nm' },
];

// Mock data generator
const generateMockData = () => {
  const requirements = Array.from({ length: 150 }, (_, i) => ({
    id: `§25.${i + 1}`,
    title: `Requirement ${i + 1}`,
    status: Math.random() > 0.15 ? 'verified' : Math.random() > 0.5 ? 'missing' : 'processing',
    document: `doc_${i + 1}.pdf`,
    value: `${Math.floor(Math.random() * 100000) + 1000}`,
    timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
  }));
  return requirements;
};

const PIPELINE_STAGES = [
  'Ingestion',
  'Processing',
  'AI Mapping',
  'Compliance',
  'Validation',
  'Audit Trail',
  'Package Output',
];

// 3D Airplane Component
const Airplane = ({ position, rotation }) => {
  const groupRef = useRef();
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.z += 0.02;
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Fuselage */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.3, 4, 8]} />
        <meshStandardMaterial color="#2563eb" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Cockpit */}
      <mesh position={[0, 0, 2]}>
        <sphereGeometry args={[0.35, 8, 8]} />
        <meshStandardMaterial color="#1e40af" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Left Wing */}
      <mesh position={[-2.5, 0, 0]}>
        <boxGeometry args={[4.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Right Wing */}
      <mesh position={[2.5, 0, 0]}>
        <boxGeometry args={[4.5, 0.2, 0.8]} />
        <meshStandardMaterial color="#1e40af" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Tail */}
      <mesh position={[0, 0.5, -2]}>
        <boxGeometry args={[0.3, 1.5, 1]} />
        <meshStandardMaterial color="#0369a1" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Glow effect */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[5, 32, 32]} />
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#2563eb"
          emissiveIntensity={0.3}
          transparent
          opacity={0.1}
        />
      </mesh>
    </group>
  );
};

// Particle Background
const ParticleBackground = ({ isActive }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const particles = [];

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(248, 250, 252, 0.01)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isActive]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        opacity: 0.3,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
};

// PDF Report Generator
const generateCertificationReport = (aircraft, requirements, metrics) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 10;
  
  const addLine = (height = 1) => {
    yPosition += height;
  };

  // Header
  doc.setFillColor(15, 23, 42); // Dark blue
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(59, 130, 246); // Blue
  doc.setFontSize(24);
  doc.text('BOEING CERTX', pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128); // Gray
  doc.text('Real-time Aerospace Certification Pipeline', pageWidth / 2, 25, { align: 'center' });
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 32, { align: 'center' });
  
  yPosition = 50;

  // Aircraft Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('AIRCRAFT CERTIFICATION REPORT', 10, yPosition);
  
  yPosition += 10;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  const aircraftModel = AIRCRAFT_MODELS.find(m => m.id === aircraft);
  doc.text(`Aircraft Model: ${aircraftModel?.name || 'Unknown'}`, 10, yPosition);
  yPosition += 6;
  doc.text(`Range: ${aircraftModel?.range || 'N/A'}`, 10, yPosition);
  yPosition += 6;
  doc.text(`Certification Date: ${new Date().toLocaleDateString()}`, 10, yPosition);
  yPosition += 6;
  doc.text(`Status: FAA LEVEL 2 CERTIFICATION`, 10, yPosition);
  
  // Horizontal line
  yPosition += 8;
  doc.setDrawColor(59, 130, 246);
  doc.line(10, yPosition, pageWidth - 10, yPosition);
  yPosition += 8;

  // Metrics Summary
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('COMPLIANCE METRICS SUMMARY', 10, yPosition);
  
  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const metricsData = [
    { label: 'Requirements Verified', value: metrics.verified, unit: '%' },
    { label: 'Total Requirements', value: metrics.total, unit: '' },
    { label: 'Missing Documents', value: metrics.missing, unit: '' },
    { label: 'Risk Level', value: metrics.riskLevel, unit: '' },
    { label: 'Time to Certification', value: metrics.certTime, unit: 'hours' },
  ];

  metricsData.forEach(metric => {
    doc.text(`${metric.label}: `, 10, yPosition);
    doc.setFont(undefined, 'bold');
    doc.text(`${metric.value}${metric.unit ? ' ' + metric.unit : ''}`, 100, yPosition);
    doc.setFont(undefined, 'normal');
    yPosition += 6;
  });

  // New page if needed
  if (yPosition > pageHeight - 60) {
    doc.addPage();
    yPosition = 10;
  }

  // Requirements Details
  yPosition += 8;
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('REQUIREMENT VERIFICATION DETAILS', 10, yPosition);
  
  yPosition += 10;
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');

  // Table header
  doc.setFillColor(107, 114, 128);
  doc.setTextColor(255, 255, 255);
  doc.rect(10, yPosition - 4, pageWidth - 20, 6, 'F');
  doc.text('Req ID', 12, yPosition);
  doc.text('Status', 45, yPosition);
  doc.text('Document', 80, yPosition);
  doc.text('Value', 150, yPosition);

  yPosition += 8;
  doc.setTextColor(15, 23, 42);

  // Table rows
  const requirementsToShow = requirements.slice(0, 30);
  requirementsToShow.forEach((req, idx) => {
    if (yPosition > pageHeight - 15) {
      doc.addPage();
      yPosition = 10;
      
      // Repeat header on new page
      doc.setFillColor(107, 114, 128);
      doc.setTextColor(255, 255, 255);
      doc.rect(10, yPosition - 4, pageWidth - 20, 6, 'F');
      doc.setFontSize(9);
      doc.text('Req ID', 12, yPosition);
      doc.text('Status', 45, yPosition);
      doc.text('Document', 80, yPosition);
      doc.text('Value', 150, yPosition);
      
      yPosition += 8;
      doc.setTextColor(15, 23, 42);
    }

    // Alternate row colors
    if (idx % 2 === 0) {
      doc.setFillColor(248, 250, 252);
      doc.rect(10, yPosition - 4, pageWidth - 20, 5, 'F');
    }

    // Status color coding
    if (req.status === 'verified') {
      doc.setTextColor(16, 185, 129); // Green
    } else if (req.status === 'missing') {
      doc.setTextColor(239, 68, 68); // Red
    } else {
      doc.setTextColor(245, 158, 11); // Amber
    }

    doc.text(req.id, 12, yPosition);
    doc.text(req.status.toUpperCase(), 45, yPosition);
    
    doc.setTextColor(15, 23, 42);
    const docName = req.document.length > 25 ? req.document.substring(0, 22) + '...' : req.document;
    doc.text(docName, 80, yPosition);
    doc.text(req.value, 150, yPosition);

    yPosition += 6;
  });

  // Footer
  yPosition = pageHeight - 20;
  doc.setDrawColor(59, 130, 246);
  doc.line(10, yPosition, pageWidth - 10, yPosition);
  
  yPosition += 5;
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('This is an official Boeing CertX certification report. For internal use only.', 10, yPosition);
  doc.text(`Report ID: ${Math.random().toString(36).substr(2, 9).toUpperCase()}`, pageWidth - 10, yPosition, { align: 'right' });
  
  yPosition += 5;
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth / 2, yPosition, { align: 'center' });

  return doc;
};


// Enhanced Metric Card with gradient
const MetricCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-600 to-blue-400 shadow-blue-500/50',
    green: 'from-green-600 to-green-400 shadow-green-500/50',
    amber: 'from-amber-600 to-amber-400 shadow-amber-500/50',
    red: 'from-red-600 to-red-400 shadow-red-500/50',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${colorMap[color]} rounded-xl p-6 shadow-2xl text-white border border-white border-opacity-20 backdrop-blur-sm hover:shadow-lg transition-all group`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-90 group-hover:opacity-100 transition">{label}</p>
          <p className="text-4xl font-bold mt-3 tracking-tight">{value}</p>
        </div>
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: Infinity, duration: 3 }}
        >
          <Icon className="w-10 h-10 opacity-70" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Enhanced Pipeline Stage with premium styling
const PipelineStage = ({ stage, isActive, processCount }) => {
  return (
    <motion.div
      className={`flex-1 px-4 py-6 rounded-xl border-2 transition-all backdrop-blur-sm ${
        isActive
          ? 'border-blue-400 bg-gradient-to-br from-blue-500/20 to-blue-400/10 shadow-2xl shadow-blue-500/50'
          : 'border-slate-300 bg-white/50 shadow-lg'
      }`}
      animate={{
        boxShadow: isActive
          ? '0 0 30px rgba(59, 130, 246, 0.6)'
          : '0 10px 30px rgba(0, 0, 0, 0.1)',
      }}
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-center">
        <motion.p className="text-sm font-bold text-slate-900 uppercase tracking-wider">{stage}</motion.p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <motion.div
            className={`w-3 h-3 rounded-full ${isActive ? 'bg-blue-500 shadow-lg shadow-blue-400' : 'bg-slate-400'}`}
            animate={isActive ? { scale: [1, 1.3, 1], opacity: [1, 0.6, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className="text-sm font-mono font-bold text-slate-700 bg-white/60 px-2 py-1 rounded">{processCount}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Enhanced Activity Log with premium styling
const ActivityLog = ({ logs }) => {
  const displayLogs = logs.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 shadow-2xl h-96 overflow-hidden flex flex-col text-white"
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 tracking-wide">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Radio className="w-5 h-5 text-blue-400" />
        </motion.div>
        <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Live Feed</span>
      </h3>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        <AnimatePresence mode="popLayout">
          {displayLogs.map((log, idx) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-lg p-3 text-sm border border-blue-400/30 hover:border-blue-400/60 transition-all hover:bg-blue-500/30 group cursor-pointer"
            >
              <div className="flex gap-3">
                <span className="text-cyan-400 text-xs mt-0.5 font-bold">◆</span>
                <div className="flex-1">
                  <p className="text-blue-100 font-semibold group-hover:text-white transition">{log.text}</p>
                  <p className="text-xs text-blue-300/70 mt-1">{log.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Enhanced Requirement Table
const RequirementTable = ({ requirements, onRowClick }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-500/10 hover:bg-green-500/20';
      case 'missing':
        return 'bg-red-500/10 hover:bg-red-500/20';
      case 'processing':
        return 'bg-amber-500/10 hover:bg-amber-500/20';
      default:
        return 'bg-white/5 hover:bg-white/10';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 rounded-xl border border-slate-700 shadow-2xl overflow-hidden backdrop-blur-sm"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-white">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 border-b border-slate-700">
            <tr>
              <th className="px-4 py-3 text-left font-bold tracking-wide">Requirement ID</th>
              <th className="px-4 py-3 text-left font-bold tracking-wide">Status</th>
              <th className="px-4 py-3 text-left font-bold tracking-wide">Document</th>
              <th className="px-4 py-3 text-left font-bold tracking-wide">Value</th>
              <th className="px-4 py-3 text-left font-bold tracking-wide"></th>
            </tr>
          </thead>
          <tbody>
            {requirements.slice(0, 10).map((req, idx) => (
              <motion.tr
                key={req.id}
                className={`border-b border-slate-700 ${getStatusBg(req.status)} transition-all cursor-pointer group`}
                onClick={() => onRowClick(req)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.01, paddingLeft: '8px' }}
              >
                <td className="px-4 py-4 font-mono text-blue-300 font-semibold">{req.id}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className="text-white capitalize font-medium group-hover:text-blue-300 transition">{req.status}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-300">{req.document}</td>
                <td className="px-4 py-4 font-mono font-bold text-green-400">{req.value}</td>
                <td className="px-4 py-4 text-right">
                  <ChevronRight className="w-4 h-4 text-blue-400 group-hover:translate-x-1 transition-transform" />
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

// Detail Panel Component
const DetailPanel = ({ requirement, onClose }) => {
  if (!requirement) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-70 z-40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 w-96 h-full bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl z-50 overflow-y-auto border-l border-slate-700 text-white"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Requirement Details</h2>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-300" />
            </motion.button>
          </div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">Requirement ID</p>
              <p className="text-2xl font-mono font-bold text-green-400">{requirement.id}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <p className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">Status</p>
              <div className="flex items-center gap-2">
                {requirement.status === 'verified' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="font-bold text-green-400">Verified</span>
                  </>
                )}
                {requirement.status === 'missing' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <span className="font-bold text-red-400">Missing</span>
                  </>
                )}
                {requirement.status === 'processing' && (
                  <>
                    <Clock className="w-5 h-5 text-amber-400 animate-spin" />
                    <span className="font-bold text-amber-400">Processing</span>
                  </>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">Document</p>
              <div className="bg-slate-800/50 p-4 rounded-lg border border-blue-500/30 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-400" />
                <span className="text-slate-200 font-mono">{requirement.document}</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <p className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">Compliance Value</p>
              <p className="text-3xl font-bold font-mono text-green-400">{requirement.value}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-sm font-bold text-blue-300 mb-2 uppercase tracking-wider">Last Updated</p>
              <p className="text-slate-300 font-mono">
                {new Date(requirement.timestamp).toLocaleString()}
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-lg font-bold hover:shadow-lg shadow-blue-500/50 flex items-center justify-center gap-2 mt-8 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Document
            </motion.button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Aircraft Model Selector
const AircraftSelector = ({ models, selectedModel, onSelectModel }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-6 shadow-2xl mb-8"
    >
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Plane className="w-5 h-5 text-blue-400" />
        <span>Aircraft Fleet</span>
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {models.map((model) => (
          <motion.button
            key={model.id}
            onClick={() => onSelectModel(model.id)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-4 rounded-lg border-2 transition-all font-semibold text-center ${
              selectedModel === model.id
                ? 'border-blue-400 bg-gradient-to-br from-blue-600/40 to-blue-500/20 shadow-lg shadow-blue-500/50 text-blue-200'
                : 'border-slate-600 bg-slate-800/50 text-slate-400 hover:border-slate-500'
            }`}
          >
            <div className="text-2xl mb-2">{model.icon}</div>
            <div className="text-xs font-bold">{model.name}</div>
            <div className="text-xs text-gray-400 mt-1">{model.range}</div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
};

// Main App Component
export default function App() {
  const [requirements, setRequirements] = useState(() => generateMockData());
  const [logs, setLogs] = useState([
    { id: 1, text: 'Fleet initialized - Ready for certification', time: 'now' },
  ]);
  const [activeStages, setActiveStages] = useState(new Set());
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stageCounts, setStageCounts] = useState(
    PIPELINE_STAGES.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {})
  );
  const [selectedAircraft, setSelectedAircraft] = useState('b787');
  const [activeStage, setActiveStage] = useState(PIPELINE_STAGES[0]);

  // Simulate pipeline activity
  useEffect(() => {
    const interval = setInterval(() => {
      const stages = Array.from(PIPELINE_STAGES);
      const randomStage = stages[Math.floor(Math.random() * stages.length)];
      setActiveStage(randomStage);

      setActiveStages((prev) => {
        const next = new Set(prev);
        next.add(randomStage);
        return next;
      });

      setStageCounts((prev) => ({
        ...prev,
        [randomStage]: prev[randomStage] + Math.floor(Math.random() * 3) + 1,
      }));

      const activities = [
        `Processing ${AIRCRAFT_MODELS.find(m => m.id === selectedAircraft)?.name} data…`,
        'Extracting compliance requirements…',
        'Mapping to CFR §25.571…',
        'Cross-referencing standards…',
        'Parsing aerodynamic data…',
        'Validating structural analysis…',
        'Generating audit trail…',
        'Preparing certification package…',
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const newLog = {
        id: Date.now(),
        text: randomActivity,
        time: 'just now',
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 20));

      setTimeout(() => {
        setActiveStages((prev) => {
          const next = new Set(prev);
          next.delete(randomStage);
          return next;
        });
      }, 1500);
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedAircraft]);

  // Calculate metrics
  const verifiedCount = requirements.filter((r) => r.status === 'verified').length;
  const missingCount = requirements.filter((r) => r.status === 'missing').length;
  const verifiedPercentage = Math.round((verifiedCount / requirements.length) * 100);
  const certificationTime = Math.max(50 - missingCount / 3, 5);

  // Generate certification package
  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate PDF
    const pdf = generateCertificationReport(selectedAircraft, requirements, {
      verified: verifiedPercentage,
      total: requirements.length,
      missing: missingCount,
      riskLevel: missingCount > 20 ? 'High' : missingCount > 10 ? 'Medium' : 'Low',
      certTime: certificationTime.toFixed(1),
    });

    // Download PDF
    pdf.save(`Boeing_CertX_Report_${new Date().getTime()}.pdf`);

    setShowSuccess(true);
    setIsGenerating(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      <ParticleBackground isActive={true} />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-900/90 to-blue-900/90 border-b border-blue-500/30 shadow-2xl sticky top-0 z-30 backdrop-blur-md"
      >
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <h1 className="text-4xl font-black text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-300 bg-clip-text">
                Boeing CertX
              </h1>
              <p className="text-sm text-blue-300/80 mt-1 font-semibold tracking-wider">
                REAL-TIME AEROSPACE CERTIFICATION PIPELINE • FAA LEVEL 2
              </p>
            </motion.div>
            <motion.div
              className="flex items-center gap-2 text-sm text-blue-300 font-bold tracking-wider bg-blue-500/20 px-4 py-2 rounded-lg border border-blue-500/40"
              animate={{ boxShadow: ['0 0 20px rgba(59, 130, 246, 0)', '0 0 20px rgba(59, 130, 246, 0.5)'] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Zap className="w-4 h-4 text-amber-400" />
              </motion.div>
              <span>🎯 Live Pipeline Active</span>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        {/* Aircraft Selector */}
        <AircraftSelector
          models={AIRCRAFT_MODELS}
          selectedModel={selectedAircraft}
          onSelectModel={setSelectedAircraft}
        />

        {/* 3D Flight Scene */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-xl border border-blue-500/30 overflow-hidden shadow-2xl h-96 bg-gradient-to-b from-blue-900/20 to-slate-900/20"
        >
          <Canvas style={{ width: '100%', height: '100%' }}>
            <PerspectiveCamera makeDefault position={[0, 5, 15]} />
            <OrbitControls autoRotate autoRotateSpeed={2} enableZoom={false} />
            <ambientLight intensity={0.7} />
            <pointLight position={[10, 10, 10]} intensity={1.2} color="#3b82f6" />
            <pointLight position={[-10, 5, -10]} intensity={0.9} color="#0369a1" />
            <Airplane
              position={[0, 0, 0]}
              rotation={[0.2, 0.5, 0.1]}
            />
            <gridHelper args={[40, 40]} />
          </Canvas>
        </motion.div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Requirements Verified"
            value={`${verifiedPercentage}%`}
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            label="Missing Documents"
            value={missingCount}
            icon={AlertCircle}
            color="red"
          />
          <MetricCard
            label="Time to Cert"
            value={`${certificationTime.toFixed(1)}h`}
            icon={Clock}
            color="blue"
          />
          <MetricCard
            label="Risk Level"
            value={missingCount > 20 ? 'High' : missingCount > 10 ? 'Medium' : 'Low'}
            icon={Zap}
            color={missingCount > 20 ? 'red' : missingCount > 10 ? 'amber' : 'green'}
          />
        </div>

        {/* Pipeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="bg-gradient-to-br from-slate-900/50 to-blue-900/50 rounded-xl border border-blue-500/30 shadow-2xl p-8 backdrop-blur-sm">
            <h2 className="text-lg font-bold text-white mb-6 tracking-wide">
              🔄 CERTIFICATION PIPELINE
            </h2>
            <div className="relative">
              <div className="flex gap-4">
                {PIPELINE_STAGES.map((stage) => (
                  <PipelineStage
                    key={stage}
                    stage={stage}
                    isActive={activeStages.has(stage)}
                    processCount={stageCounts[stage]}
                  />
                ))}
              </div>
              <div className="absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 rounded-full pointer-events-none opacity-30" />
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Activity + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-bold text-white mb-4 tracking-wide">
                📋 DOCUMENT VERIFICATION ({requirements.length} total)
              </h2>
              <RequirementTable
                requirements={requirements}
                onRowClick={setSelectedRequirement}
              />
            </motion.div>
          </div>

          <div>
            <ActivityLog logs={logs} />
          </div>
        </div>

        {/* Generate Package Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-center mb-12"
        >
          <motion.button
            onClick={handleGeneratePackage}
            disabled={isGenerating || verifiedPercentage < 80}
            className={`px-12 py-4 rounded-xl font-bold text-lg flex items-center gap-3 transition-all shadow-2xl tracking-wide ${
              verifiedPercentage < 80
                ? 'bg-slate-600 cursor-not-allowed opacity-50'
                : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-green-500/50 hover:shadow-lg'
            }`}
            animate={isGenerating ? { scale: 0.98 } : {}}
            whileHover={verifiedPercentage >= 80 ? { y: -3 } : {}}
          >
            {isGenerating ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <span>Generating FAA Package...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>🚀 Generate FAA Certification Package</span>
              </>
            )}
          </motion.button>
        </motion.div>

        {/* Success Modal */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-green-500/50"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <motion.div
                  className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: 3, duration: 0.6 }}
                >
                  <CheckCircle className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-center text-transparent bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text mb-2">
                  Success!
                </h3>
                <p className="text-center text-slate-300 mb-2 font-semibold">
                  FAA Certification Package Generated
                </p>
                <p className="text-center text-slate-400 text-sm mb-6">
                  PDF report has been downloaded to your device with all compliance details and verification status.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowSuccess(false)}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg font-bold hover:shadow-lg shadow-green-500/50 transition-all"
                >
                  ✓ Close
                </motion.button>
              </motion.div>
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={false}
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-green-400 rounded-full"
                    initial={{
                      x: '50vw',
                      y: '50vh',
                      opacity: 1,
                    }}
                    animate={{
                      x: `${Math.random() * 100 - 50}vw`,
                      y: `${Math.random() * 100 - 50}vh`,
                      opacity: 0,
                    }}
                    transition={{ duration: 2, delay: i * 0.08 }}
                  />
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Detail Panel */}
      <DetailPanel requirement={selectedRequirement} onClose={() => setSelectedRequirement(null)} />
    </div>
  );
}
