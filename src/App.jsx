import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';

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

// Metric Card Component
const MetricCard = ({ label, value, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900',
    green: 'from-green-50 to-green-100 border-green-200 text-green-900',
    amber: 'from-amber-50 to-amber-100 border-amber-200 text-amber-900',
    red: 'from-red-50 to-red-100 border-red-200 text-red-900',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-gradient-to-br ${colorMap[color]} border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-75">{label}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-40" />
      </div>
    </motion.div>
  );
};

// Pipeline Stage Component
const PipelineStage = ({ stage, isActive, processCount }) => {
  return (
    <motion.div
      className={`flex-1 px-3 py-4 rounded-lg border-2 transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-slate-200 bg-white shadow-sm'
      }`}
      animate={{
        boxShadow: isActive
          ? '0 0 16px rgba(59, 130, 246, 0.4)'
          : '0 0 0px rgba(0, 0, 0, 0)',
      }}
    >
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-900">{stage}</p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <motion.div
            className={`w-2 h-2 rounded-full ${isActive ? 'bg-blue-500' : 'bg-slate-300'}`}
            animate={isActive ? { scale: [1, 1.2, 1] } : {}}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
          <span className="text-xs font-mono text-slate-600">{processCount}</span>
        </div>
      </div>
    </motion.div>
  );
};

// Activity Log Component
const ActivityLog = ({ logs }) => {
  const displayLogs = logs.slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm h-96 overflow-hidden flex flex-col"
    >
      <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-500" />
        Live Activity
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
              className="bg-slate-50 rounded p-3 text-sm border border-slate-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex gap-2">
                <span className="text-slate-500 text-xs mt-0.5">◆</span>
                <div>
                  <p className="text-slate-900 font-medium">{log.text}</p>
                  <p className="text-xs text-slate-500 mt-1">{log.time}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Animated Agent Node
const AgentNode = ({ stage, delay }) => {
  return (
    <motion.div
      className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-lg"
      style={{
        top: '-8px',
        left: `${(stage / (PIPELINE_STAGES.length - 1)) * 100}%`,
      }}
      animate={{
        left: [`${(stage / (PIPELINE_STAGES.length - 1)) * 100}%`, `${((stage + 1) / (PIPELINE_STAGES.length - 1)) * 100}%`],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        repeatType: 'loop',
      }}
      initial={false}
    >
      <motion.div
        className="absolute w-3 h-3 bg-blue-400 rounded-full"
        animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ top: 0, left: 0 }}
      />
    </motion.div>
  );
};

// Requirement Table Component
const RequirementTable = ({ requirements, onRowClick }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'missing':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-amber-500 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-green-50';
      case 'missing':
        return 'bg-red-50';
      case 'processing':
        return 'bg-amber-50';
      default:
        return 'bg-white';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Requirement ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Document</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Value</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {requirements.slice(0, 10).map((req, idx) => (
              <motion.tr
                key={req.id}
                className={`border-b border-slate-100 hover:bg-blue-50 cursor-pointer transition-colors ${getStatusBg(
                  req.status
                )}`}
                onClick={() => onRowClick(req)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td className="px-4 py-3 font-mono text-slate-900">{req.id}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(req.status)}
                    <span className="text-slate-700 capitalize">{req.status}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600">{req.document}</td>
                <td className="px-4 py-3 font-mono text-slate-900">{req.value}</td>
                <td className="px-4 py-3 text-right">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
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
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed right-0 top-0 w-96 h-full bg-white shadow-2xl z-50 overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Requirement Details</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-100 rounded transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Requirement ID</p>
              <p className="text-lg font-mono font-bold text-slate-900">{requirement.id}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Status</p>
              <div className="flex items-center gap-2">
                {requirement.status === 'verified' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="font-semibold text-green-700">Verified</span>
                  </>
                )}
                {requirement.status === 'missing' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="font-semibold text-red-700">Missing</span>
                  </>
                )}
                {requirement.status === 'processing' && (
                  <>
                    <Clock className="w-5 h-5 text-amber-500 animate-spin" />
                    <span className="font-semibold text-amber-700">Processing</span>
                  </>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Document</p>
              <div className="bg-slate-50 p-3 rounded border border-slate-200 flex items-center gap-3">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-slate-900">{requirement.document}</span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Value</p>
              <p className="text-2xl font-bold font-mono text-slate-900">{requirement.value}</p>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">Last Updated</p>
              <p className="text-slate-700">
                {new Date(requirement.timestamp).toLocaleString()}
              </p>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 mt-8">
              <Download className="w-4 h-4" />
              Download Document
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main App Component
export default function App() {
  const [requirements, setRequirements] = useState(() => generateMockData());
  const [logs, setLogs] = useState([
    { id: 1, text: 'Pipeline initialized', time: 'now' },
  ]);
  const [activeStages, setActiveStages] = useState(new Set());
  const [selectedRequirement, setSelectedRequirement] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [stageCounts, setStageCounts] = useState(
    PIPELINE_STAGES.reduce((acc, stage) => ({ ...acc, [stage]: 0 }), {})
  );

  // Simulate pipeline activity
  useEffect(() => {
    const interval = setInterval(() => {
      // Random stage activity
      const randomStage = PIPELINE_STAGES[Math.floor(Math.random() * PIPELINE_STAGES.length)];
      setActiveStages((prev) => {
        const next = new Set(prev);
        next.add(randomStage);
        return next;
      });

      // Update stage counts
      setStageCounts((prev) => ({
        ...prev,
        [randomStage]: prev[randomStage] + Math.floor(Math.random() * 3) + 1,
      }));

      // Add log entry
      const activities = [
        'Fetching supplier data…',
        'Parsing PDF: fatigue_test_v3.pdf',
        'Mapping to CFR §25.571',
        'Validation passed',
        'Extracting compliance metrics',
        'Cross-referencing standards',
        'Generating audit trail',
        'Preparing certification package',
      ];
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const newLog = {
        id: Date.now(),
        text: randomActivity,
        time: 'just now',
      };
      setLogs((prev) => [newLog, ...prev].slice(0, 20));

      // Clear active stages after a delay
      setTimeout(() => {
        setActiveStages((prev) => {
          const next = new Set(prev);
          next.delete(randomStage);
          return next;
        });
      }, 1500);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Calculate metrics
  const verifiedCount = requirements.filter((r) => r.status === 'verified').length;
  const missingCount = requirements.filter((r) => r.status === 'missing').length;
  const processingCount = requirements.filter((r) => r.status === 'processing').length;
  const verifiedPercentage = Math.round((verifiedCount / requirements.length) * 100);
  const certificationTime = Math.max(50 - missingCount / 3, 5);

  // Generate certification package
  const handleGeneratePackage = async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setShowSuccess(true);
    setIsGenerating(false);
    setTimeout(() => setShowSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-blue-50">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Boeing CertX</h1>
              <p className="text-sm text-slate-600 mt-1">
                Real-time Certification Pipeline · FAA Level 2
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Live Pipeline Active</span>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
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
            label="Time to Certification"
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
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
            <h2 className="text-lg font-semibold text-slate-900 mb-6">Certification Pipeline</h2>
            <div className="relative">
              {/* Agent nodes */}
              {[0, 1, 2].map((idx) => (
                <AgentNode key={idx} stage={0} delay={idx * 1} />
              ))}

              {/* Pipeline stages */}
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

              {/* Flow connector */}
              <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300 to-transparent pointer-events-none -z-10" />
            </div>
          </div>
        </motion.div>

        {/* Bottom Section: Activity + Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main content: Requirement Table */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Document Verification ({requirements.length} total)
              </h2>
              <RequirementTable
                requirements={requirements}
                onRowClick={setSelectedRequirement}
              />
            </motion.div>
          </div>

          {/* Side: Activity Log */}
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
            className={`px-12 py-4 rounded-lg font-semibold text-white text-lg flex items-center gap-3 transition-all ${
              verifiedPercentage < 80
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl'
            }`}
            animate={isGenerating ? { scale: 0.98 } : {}}
          >
            {isGenerating ? (
              <>
                <motion.div
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <span>Generating Certification Package...</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5" />
                <span>Generate FAA Certification Package</span>
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
                className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: 3, duration: 0.5 }}
                >
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-center text-slate-900 mb-2">
                  Success!
                </h3>
                <p className="text-center text-slate-600 mb-6">
                  FAA Certification Package generated and ready for submission.
                </p>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                  Download Package
                </button>
              </motion.div>
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={false}
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-green-400 rounded-full"
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
                    transition={{ duration: 2, delay: i * 0.1 }}
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
