import React, { useState } from 'react';
import { UserProfile } from '../types';
import { analyzeStyle } from '../services/gemini';
import StyleRadar from '../components/StyleRadar';
import { Upload, Loader2, ArrowRight, FileText, ShieldCheck, Trash2, Cpu, Activity, Database } from 'lucide-react';

interface DashboardProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onNavigateToEditor: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onUpdateProfile, onNavigateToEditor }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [inputText, setInputText] = useState(userProfile.sampleText || '');

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;
    
    setIsAnalyzing(true);
    try {
      const metrics = await analyzeStyle(inputText);
      onUpdateProfile({
        ...userProfile,
        hasAnalyzedSamples: true,
        baseStyle: metrics,
        sampleText: inputText
      });
    } catch (e) {
      console.error(e);
      alert("Analysis Protocol Failed. Retry.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClearData = () => {
    // Immediate reset without confirmation dialog to ensure button responsiveness
    onUpdateProfile({
        ...userProfile,
        hasAnalyzedSamples: false,
        sampleText: '',
        baseStyle: {
            vocabularyComplexity: 50,
            sentenceVariety: 50,
            formality: 50,
            imagery: 50,
            warmth: 50,
            pacing: 50
        }
    });
    setInputText('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setInputText(prev => prev + "\n\n" + text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-12 space-y-8 font-sans">
      {/* Header Section */}
      <header className="grid grid-cols-1 md:grid-cols-12 gap-6 border-b-4 border-ink pb-8">
        <div className="md:col-span-8 space-y-2">
           <div className="flex items-center gap-2 mb-4">
             <div className="bg-ink text-paper px-2 py-1 text-xs font-mono font-bold tracking-widest uppercase">
               Draft Ready
             </div>
             <div className="h-px bg-ink flex-1"></div>
             <div className="text-xs font-mono text-ink/60">V.2.0.4</div>
           </div>
           <h1 className="text-6xl md:text-8xl font-display font-bold text-ink leading-[0.85] tracking-tighter uppercase">
             WRITE<span className="text-industrial-orange">MOTION</span>
           </h1>
           <p className="text-lg md:text-xl font-mono text-ink mt-4 max-w-2xl border-l-2 border-industrial-orange pl-4">
             Stylistic AI Writing Engine. <br/>
             Absorb great styles. Blend. <br/>
             Bring life to your writing.
           </p>
        </div>
        <div className="md:col-span-4 flex flex-col justify-between font-mono text-xs border border-ink p-4 bg-white/50">
            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>UNIT STATUS:</span>
                    <span className="text-industrial-orange font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between">
                    <span>ACCESS:</span>
                    <span>GUEST / LOCAL</span>
                </div>
                <div className="flex justify-between">
                    <span>ENCRYPTION:</span>
                    <span>CLIENT-SIDE</span>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-ink/20">
                 <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-industrial-orange" />
                    <span className="opacity-70">SESSION STORAGE ONLY</span>
                 </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-ink pb-2">
            <label className="font-display font-bold text-xl uppercase flex items-center gap-2">
                <Database size={20} /> Source Material
            </label>
            <div className="relative group">
              <input 
                type="file" 
                accept=".txt,.md,.doc,.docx,.pdf" 
                onChange={handleFileUpload} 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button className="bg-white border border-ink px-3 py-1 text-xs font-mono hover:bg-industrial-orange hover:text-white transition-colors uppercase flex items-center gap-2">
                <Upload size={12} /> Upload Sources
              </button>
            </div>
          </div>
          
          <div className="relative">
             <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full h-96 bg-white border-2 border-ink p-6 text-ink focus:outline-none focus:ring-4 focus:ring-industrial-orange/20 resize-none font-mono text-sm leading-relaxed"
                placeholder="// PASTE SOURCE MATERIAL WITH YOUR STYLE HERE FOR ANALYSIS..."
            />
            <div className="absolute top-0 right-0 p-2 pointer-events-none">
                 <div className="w-2 h-2 bg-industrial-orange animate-pulse"></div>
            </div>
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !inputText.trim()}
            className="w-full py-4 bg-ink text-white hover:bg-industrial-orange disabled:bg-industrial-gray disabled:cursor-not-allowed font-mono font-bold text-lg uppercase tracking-wider transition-colors border-2 border-transparent hover:border-ink flex items-center justify-center gap-3"
          >
            {isAnalyzing ? (
              <>
                <Loader2 size={20} className="animate-spin" /> Processing Vector...
              </>
            ) : (
              <>
                <Activity size={20} /> Initiate Analysis
              </>
            )}
          </button>
        </div>

        {/* Results Column */}
        <div className="space-y-6 flex flex-col">
          <div className="flex-1 bg-white border-2 border-ink p-8 relative flex flex-col items-center justify-center min-h-[400px]">
            {/* Background Grid for Chart Area */}
            <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none"></div>

            {!userProfile.hasAnalyzedSamples ? (
              <div className="text-center space-y-6 relative z-10 max-w-sm">
                <div className="w-24 h-24 border-2 border-ink border-dashed flex items-center justify-center mx-auto bg-paper">
                  <Cpu size={48} className="text-industrial-dim" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-2xl uppercase">No Signal Detected</h3>
                    <p className="font-mono text-sm text-industrial-dim mt-2">
                        Upload writing samples to construct style fingerprint.
                    </p>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex flex-col relative z-10 animate-in fade-in duration-500">
                <div className="flex items-center justify-between border-b border-ink pb-4 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-2xl uppercase">Style Fingerprint</h3>
                    <p className="font-mono text-xs text-industrial-dim">ID: {userProfile.name.toUpperCase()}_001</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                        onClick={handleClearData} 
                        className="p-2 hover:bg-red-600 hover:text-white border border-transparent hover:border-ink transition-colors"
                        title="Purge Data"
                    >
                        <Trash2 size={16} />
                    </button>
                    <div className="px-2 py-1 bg-industrial-orange text-white text-xs font-mono font-bold uppercase">
                        Active
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 min-h-0 relative">
                     <StyleRadar metrics={userProfile.baseStyle} className="h-full" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 font-mono text-xs">
                   <div className="border border-ink p-3 bg-paper">
                      <span className="block text-industrial-dim uppercase tracking-wider mb-1">DOMINANT_TRAIT</span>
                      <span className="text-ink font-bold text-sm">
                        {userProfile.baseStyle.imagery > 70 ? "HIGH_IMAGERY" : 
                         userProfile.baseStyle.formality > 70 ? "FORMAL_ACADEMIC" :
                         userProfile.baseStyle.warmth > 70 ? "HIGH_WARMTH" : "BALANCED_DIRECT"}
                      </span>
                   </div>
                   <div className="border border-ink p-3 bg-paper">
                      <span className="block text-industrial-dim uppercase tracking-wider mb-1">SYNTAX_MODEL</span>
                      <span className="text-ink font-bold text-sm">
                        {userProfile.baseStyle.sentenceVariety > 60 ? "COMPLEX_VARIED" : "DIRECT_CONCISE"}
                      </span>
                   </div>
                </div>
              </div>
            )}
            
            {/* Corners */}
            <div className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-ink"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-ink"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-ink"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-ink"></div>
          </div>

          {userProfile.hasAnalyzedSamples && (
            <button
              onClick={onNavigateToEditor}
              className="w-full py-4 bg-industrial-orange text-white hover:bg-ink border-2 border-transparent hover:border-industrial-orange transition-all font-display font-bold text-xl uppercase flex items-center justify-center gap-4 group"
            >
              Initialize <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;