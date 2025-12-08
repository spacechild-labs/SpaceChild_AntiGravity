/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';
import { ArrowRight, Activity, Zap, Radio, Brain } from 'lucide-react';

// --- CONTROL LOOP SCHEMATIC ---
export const ControlLoopSchematic: React.FC = () => {
  return (
    <div className="w-full p-8 border border-stone-800 bg-space-panel/50 rounded-xl relative overflow-hidden">
      <div className="absolute top-0 right-0 px-2 py-1 bg-stone-800 text-[10px] font-mono text-stone-500 uppercase">Fig 2.1: APF Architecture</div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 font-mono text-xs text-center">
         
         {/* Input */}
         <div className="flex flex-col items-center gap-2 group">
             <div className="w-24 h-16 border border-stone-600 rounded flex items-center justify-center bg-black group-hover:border-stone-400 transition-colors">
                <span className="text-stone-400">Raw Pulses</span>
             </div>
             <ArrowRight className="rotate-90 md:rotate-0 text-stone-600"/>
         </div>

         {/* Estimator */}
         <div className="flex flex-col items-center gap-2 group">
             <div className="w-24 h-16 border border-signal-dim rounded flex flex-col items-center justify-center bg-black group-hover:border-signal-yellow transition-colors relative">
                <span className="text-signal-yellow font-bold">Phase Est.</span>
                <span className="text-[9px] text-stone-500 mt-1">R(t), ψ(t)</span>
             </div>
             <ArrowRight className="rotate-90 md:rotate-0 text-signal-yellow"/>
         </div>

         {/* PID Controller (The Brain) */}
         <div className="flex flex-col items-center gap-2 relative z-10">
             <div className="w-32 h-24 border-2 border-signal-yellow rounded-lg flex flex-col items-center justify-center bg-stone-900 shadow-[0_0_15px_rgba(255,215,0,0.2)]">
                <Brain size={20} className="text-signal-yellow mb-2 animate-pulse"/>
                <span className="text-white font-bold">PID Controller</span>
                <span className="text-[9px] text-stone-400 mt-1">K_p, K_i, K_d</span>
             </div>
             <div className="absolute -top-6 text-signal-safe text-[9px] whitespace-nowrap">R_ref = 0.73</div>
             <ArrowRight className="rotate-90 md:rotate-0 text-signal-yellow"/>
         </div>

         {/* Injection */}
         <div className="flex flex-col items-center gap-2 group">
             <div className="w-24 h-16 border border-signal-dim rounded flex flex-col items-center justify-center bg-black group-hover:border-signal-yellow transition-colors">
                <span className="text-signal-yellow">Injection</span>
                <span className="text-[9px] text-stone-500 mt-1">Δt_inject</span>
             </div>
             <ArrowRight className="rotate-90 md:rotate-0 text-stone-600"/>
         </div>

         {/* Output */}
         <div className="flex flex-col items-center gap-2">
             <div className="w-24 h-16 border border-stone-600 rounded flex items-center justify-center bg-black">
                <span className="text-white font-bold">Output</span>
             </div>
         </div>
      </div>
    </div>
  );
};

// --- STABILITY MONITOR (R-Value Graph) ---
export const StabilityMonitor: React.FC = () => {
    // Generate simulated data that hovers around 0.73
    const generateData = () => {
        const data = [];
        let r = 0.73;
        for (let i = 0; i < 100; i++) {
            // Random walk but pulled back to 0.73
            const noise = (Math.random() - 0.5) * 0.05;
            const correction = (0.73 - r) * 0.1; 
            r = r + noise + correction;
            // Clamp roughly
            r = Math.max(0.6, Math.min(0.85, r));
            data.push({ time: i, value: r });
        }
        return data;
    };

    const [data, setData] = useState(generateData());

    useEffect(() => {
        const interval = setInterval(() => {
            setData(prev => {
                const last = prev[prev.length - 1];
                const noise = (Math.random() - 0.5) * 0.08;
                const correction = (0.73 - last.value) * 0.2; // Strong corrective force (PID)
                const nextVal = Math.max(0.62, Math.min(0.84, last.value + noise + correction));
                
                return [...prev.slice(1), { time: last.time + 1, value: nextVal }];
            });
        }, 100);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="p-6 bg-space-panel border border-space-border rounded-xl h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-mono text-sm text-stone-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity size={14} className="text-signal-safe"/> R(t) Stability Monitor
                </h3>
                <div className="text-xs font-mono text-signal-yellow">
                    LIVE: {data[data.length-1].value.toFixed(3)}
                </div>
            </div>
            
            <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <XAxis dataKey="time" hide />
                        <YAxis domain={[0, 1]} hide />
                        {/* Safe Zone Background hints would be complex in recharts, represented by ref lines */}
                        <ReferenceLine y={1.0} stroke="#FF4400" strokeDasharray="3 3" label={{ position: 'right', value: 'ABSORPTION (1.0)', fill: '#FF4400', fontSize: 10 }} />
                        <ReferenceLine y={0.84} stroke="#00FF9D" strokeDasharray="2 2" strokeOpacity={0.3} />
                        <ReferenceLine y={0.62} stroke="#00FF9D" strokeDasharray="2 2" strokeOpacity={0.3} />
                        <ReferenceLine y={0.73} stroke="#FFD700" strokeOpacity={0.5} label={{ position: 'right', value: 'REF (0.73)', fill: '#FFD700', fontSize: 10 }} />
                        
                        <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke="#FFD700" 
                            strokeWidth={2} 
                            dot={false}
                            isAnimationActive={false} // Performance for real-time
                        />
                    </LineChart>
                </ResponsiveContainer>
                {/* Overlay Text for bands */}
                <div className="absolute top-[16%] right-4 text-[9px] font-mono text-signal-safe opacity-50">UPPER BOUND (0.84)</div>
                <div className="absolute bottom-[38%] right-4 text-[9px] font-mono text-signal-safe opacity-50">LOWER BOUND (0.62)</div>
            </div>
        </div>
    )
}

// --- METRICS DASHBOARD ---
export const MetricsDashboard: React.FC = () => {
    return (
        <div className="grid grid-cols-2 gap-4 font-mono">
            <MetricCard 
                label="Order Param (R)" 
                value="0.731" 
                delta="± 0.038" 
                color="text-signal-yellow"
                icon={<Radio size={16} />} 
            />
            <MetricCard 
                label="Eff. Complexity (Φ)" 
                value="11.4" 
                delta="± 0.9 bits" 
                color="text-blue-400" 
                icon={<Zap size={16} />}
            />
            <MetricCard 
                label="LLI (Sync)" 
                value="2.31" 
                delta="± 0.14" 
                color="text-purple-400" 
                icon={<Activity size={16} />}
            />
            <MetricCard 
                label="Creativity DI" 
                value="0.31" 
                delta="(OPTIMAL)" 
                color="text-signal-safe" 
                icon={<Brain size={16} />}
            />
        </div>
    )
}

const MetricCard = ({ label, value, delta, color, icon }: any) => (
    <div className="bg-black/50 border border-stone-800 p-4 rounded-lg flex flex-col items-start hover:border-stone-600 transition-colors">
        <div className={`flex items-center gap-2 mb-2 ${color} opacity-80`}>
            {icon}
            <span className="text-[10px] uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-3xl font-bold text-white mb-1">{value}</div>
        <div className="text-xs text-stone-500">{delta}</div>
    </div>
);
