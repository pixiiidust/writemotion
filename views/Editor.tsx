import React, { useState } from 'react';
import { UserProfile, ReferenceAuthor, EditorSettings, RewriteSuggestion, SessionStats } from '../types';
import { generateRewrites, generateAuthorPersona } from '../services/gemini';
import AuthorCard from '../components/AuthorCard';
import { Wand2, Sliders, RefreshCw, Check, X, ChevronLeft, RotateCcw, Search, BarChart3, Info, Plus, Loader2, Download, Copy, FileText, FileDown, Share, Settings, PenTool, Save, Filter, ArrowDownAZ, Menu } from 'lucide-react';
import { jsPDF } from "jspdf";

interface EditorProps {
  userProfile: UserProfile;
  authors: ReferenceAuthor[];
  onAddAuthor: (author: ReferenceAuthor, persist: boolean) => void;
  onBack: () => void;
}

const Editor: React.FC<EditorProps> = ({ userProfile, authors, onAddAuthor, onBack }) => {
  const [content, setContent] = useState('');
  const [selection, setSelection] = useState('');
  const [settings, setSettings] = useState<EditorSettings>({
    blendIntensity: 0.5,
    targetAuthorIds: [],
    toneShift: 'neutral'
  });
  
  const [stats, setStats] = useState<SessionStats>({
    suggestionsGenerated: 0,
    suggestionsAccepted: 0,
    sessionDuration: 0
  });

  const [suggestions, setSuggestions] = useState<RewriteSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  
  const [generationContext, setGenerationContext] = useState<{ type: 'selection' | 'full', originalText: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingPersona, setIsAddingPersona] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  // New state for sorting and filtering
  const [sortOrder, setSortOrder] = useState<'name' | 'category'>('name');
  const [hideUnselected, setHideUnselected] = useState(false);

  const selectedAuthors = authors.filter(a => settings.targetAuthorIds.includes(a.id));
  
  const filteredAuthors = authors
    .filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = hideUnselected ? settings.targetAuthorIds.includes(a.id) : true;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
        if (sortOrder === 'category') {
            const catCompare = a.category.localeCompare(b.category);
            if (catCompare !== 0) return catCompare;
            return a.name.localeCompare(b.name);
        }
        return a.name.localeCompare(b.name);
    });

  const hasContent = content.trim().length > 5 || selection.length > 0;
  const hasAuthors = selectedAuthors.length > 0;

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    const selectedText = target.value.substring(target.selectionStart, target.selectionEnd);
    if (selectedText.length > 5) {
      setSelection(selectedText);
    } else {
      setSelection('');
    }
  };

  const handleAuthorToggle = (id: string) => {
    setSettings(prev => {
      if (prev.targetAuthorIds.includes(id)) {
        return { ...prev, targetAuthorIds: prev.targetAuthorIds.filter(aid => aid !== id) };
      }
      if (prev.targetAuthorIds.length >= 2) {
        return { ...prev, targetAuthorIds: [prev.targetAuthorIds[1], id] };
      }
      return { ...prev, targetAuthorIds: [...prev.targetAuthorIds, id] };
    });
  };

  const handleAddPersona = async () => {
    if (!searchQuery.trim()) return;
    setIsAddingPersona(true);
    const newAuthor = await generateAuthorPersona(searchQuery);
    if (newAuthor) {
      onAddAuthor(newAuthor, saveToLibrary);
      handleAuthorToggle(newAuthor.id);
      setSearchQuery('');
    } else {
      alert("Analysis failed for target persona.");
    }
    setIsAddingPersona(false);
  };

  const handleGenerate = async () => {
    const textToProcess = selection || content;
    if (!textToProcess.trim() || selectedAuthors.length === 0) return;
    setGenerationContext({ type: selection ? 'selection' : 'full', originalText: textToProcess });
    setIsGenerating(true);
    const results = await generateRewrites(
      textToProcess,
      userProfile.baseStyle,
      selectedAuthors.map(a => a.name),
      settings.blendIntensity,
      settings.toneShift
    );
    setSuggestions(results);
    setStats(prev => ({ ...prev, suggestionsGenerated: prev.suggestionsGenerated + results.length }));
    setIsGenerating(false);
  };

  const applySuggestion = (text: string) => {
    if (generationContext?.type === 'selection') {
      setContent(prev => prev.replace(generationContext.originalText, text));
      setSelection('');
    } else {
      setContent(text);
    }
    setSuggestions([]);
    setStats(prev => ({ ...prev, suggestionsAccepted: prev.suggestionsAccepted + 1 }));
  };

  const resetToBaseline = () => {
    setSettings(prev => ({ ...prev, targetAuthorIds: [] }));
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
      setShowExportMenu(false);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const handleDownloadTxt = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "writemotion-draft.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    setShowExportMenu(false);
  };
  
  const handleDownloadMd = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = "writemotion-draft.md";
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
    setShowExportMenu(false);
  };

  const handleDownloadPdf = () => {
    try {
      const doc = new jsPDF();
      
      // Configure PDF style to match app aesthetic
      doc.setFont("courier", "normal"); 
      doc.setFontSize(11);
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      const lineHeight = 6;
      
      // Header
      doc.setFontSize(8);
      doc.text("WRITEMOTION // GENERATED DRAFT", margin, 10);
      doc.text(`DATE: ${new Date().toLocaleDateString()}`, margin, 15);
      
      // Body
      doc.setFontSize(11);
      const splitText = doc.splitTextToSize(content || "", maxLineWidth);
      let cursorY = margin + 10;
  
      splitText.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
             // Header on new pages
            doc.setFontSize(8);
            doc.text("WRITEMOTION // GENERATED DRAFT", margin, 10);
            doc.setFontSize(11);
            cursorY += 10;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
      });
  
      doc.save("writemotion-draft.pdf");
      setShowExportMenu(false);
    } catch (e) {
      console.error("PDF Generation failed", e);
      alert("Failed to generate PDF. Please try checking your text for unsupported characters.");
    }
  };

  const acceptanceRate = stats.suggestionsGenerated > 0 
    ? Math.round((stats.suggestionsAccepted / stats.suggestionsGenerated) * 100) 
    : 0;

  // Sidebar is visible if toggled ON OR if suggestions are being shown
  const isSidebarVisible = showSidebar || suggestions.length > 0;

  return (
    <div className="h-screen bg-paper text-ink overflow-hidden font-sans relative">
      
      {/* Persistent Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 border-b-2 border-ink flex items-center px-4 md:px-6 justify-between bg-paper z-50">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-ink hover:text-industrial-orange flex items-center gap-2 text-xs font-mono font-bold uppercase transition-colors">
            <ChevronLeft size={14} /> Back
          </button>
          <div className="h-6 w-px bg-ink/30 hidden md:block"></div>
          <span className="text-sm font-display font-bold text-ink uppercase tracking-widest hidden md:inline">Drafting Canvas</span>
        </div>
        
        <div className="flex items-center gap-4">
           {selectedAuthors.length > 0 ? (
              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => setShowSidebar(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-industrial-orange/10 border border-industrial-orange text-xs font-mono uppercase hover:bg-industrial-orange hover:text-white transition-colors group"
                >
                  <div className="flex -space-x-1">
                      {selectedAuthors.map(a => (
                           <img key={a.id} src={a.avatarUrl} alt="" className="w-5 h-5 rounded-none border border-ink grayscale group-hover:grayscale-0" />
                      ))}
                  </div>
                  <span className="text-ink group-hover:text-white"><span className="font-bold">Active:</span> {selectedAuthors.map(a => a.name.split(' ')[1] || a.name).join(' + ')}</span>
                </button>
                <button 
                  onClick={resetToBaseline}
                  className="p-1.5 text-ink hover:text-red-500 border border-transparent hover:border-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
           ) : (
              <button 
                onClick={() => setShowSidebar(!showSidebar)}
                className={`flex items-center gap-2 text-xs font-mono font-bold uppercase bg-white border border-ink hover:bg-ink hover:text-white text-ink px-3 py-1.5 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] ${hasContent && !hasAuthors ? 'animate-pulse' : ''}`}
              >
                <Search size={12} />
                Select Scribe
              </button>
           )}

           {/* Hamburger Menu to Toggle Sidebar */}
           <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 border border-transparent hover:bg-ink/5 hover:border-ink transition-colors"
           >
              <Menu size={20} />
           </button>
        </div>
      </header>

      {/* Main Drafting Area - Padded top to avoid header overlap */}
      <div className="flex-1 flex flex-col h-full pt-16 transition-all duration-300 w-full relative z-0">
        <div className="flex-1 overflow-auto p-4 md:p-8 flex justify-center relative bg-grid-pattern">
           {/* Document Container */}
           <div className="w-full max-w-4xl h-full min-h-[600px] bg-white border-2 border-ink shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] relative flex flex-col">
              
              {/* Technical Header inside Document */}
              <div className="border-b border-ink p-2 flex justify-between items-center bg-paper/50 text-[10px] font-mono text-industrial-dim select-none relative">
                  <div className="flex gap-4">
                    <span>DOC_REF: {Date.now().toString().slice(-6)}</span>
                    <span>STATUS: DRAFT</span>
                    <span>LN: {content.split('\n').length}</span>
                  </div>

                  {/* Export Button Relocated Here */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowExportMenu(!showExportMenu)}
                      className="flex items-center gap-2 px-2 py-0.5 bg-white border border-ink hover:bg-ink hover:text-white transition-all text-[10px] font-mono font-bold uppercase"
                    >
                        {copyFeedback ? <Check size={10} className="text-emerald-500" /> : <Share size={10} />}
                        <span>Export</span>
                    </button>
                    
                    {showExportMenu && (
                      <div className="absolute right-0 top-6 w-40 bg-white border-2 border-ink shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-50">
                        <button onClick={handleCopyToClipboard} className="w-full text-left px-3 py-2 text-[10px] font-mono text-ink hover:bg-paper flex items-center gap-2 transition-colors border-b border-ink/10">
                            <Copy size={10} /> Copy to Clipboard
                        </button>
                        <button onClick={handleDownloadTxt} className="w-full text-left px-3 py-2 text-[10px] font-mono text-ink hover:bg-paper flex items-center gap-2 transition-colors border-b border-ink/10">
                            <FileText size={10} /> Download .txt
                        </button>
                        <button onClick={handleDownloadMd} className="w-full text-left px-3 py-2 text-[10px] font-mono text-ink hover:bg-paper flex items-center gap-2 transition-colors border-b border-ink/10">
                            <FileDown size={10} /> Download .md
                        </button>
                        <button onClick={handleDownloadPdf} className="w-full text-left px-3 py-2 text-[10px] font-mono text-ink hover:bg-paper flex items-center gap-2 transition-colors">
                            <FileText size={10} /> Download .pdf
                        </button>
                      </div>
                    )}
                    {showExportMenu && <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)}></div>}
                  </div>
              </div>

              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onSelect={handleSelect}
                placeholder="INPUT TEXT STREAM..."
                className="flex-1 w-full bg-transparent border-none outline-none resize-none font-serif text-lg md:text-xl leading-loose text-ink p-8 md:p-12 placeholder:text-ink/20 placeholder:font-mono placeholder:text-sm"
                spellCheck={false}
              />
              {/* Corner marks */}
              <div className="absolute top-0 left-0 w-2 h-2 border-l-2 border-t-2 border-ink"></div>
              <div className="absolute top-0 right-0 w-2 h-2 border-r-2 border-t-2 border-ink"></div>
              <div className="absolute bottom-0 left-0 w-2 h-2 border-l-2 border-b-2 border-ink"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-r-2 border-b-2 border-ink"></div>
           </div>
        </div>

        {/* Floating Action Button for Selection */}
        {selection && !suggestions.length && (
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
             <button
               onClick={handleGenerate}
               disabled={selectedAuthors.length === 0 || isGenerating}
               className="flex items-center gap-2 px-6 py-3 bg-industrial-orange text-white border-2 border-black font-mono font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
             >
               {isGenerating ? <RefreshCw className="animate-spin" size={16} /> : <Wand2 size={16} />}
               {selectedAuthors.length > 0 ? "Process Selection" : "Select Scribe First"}
             </button>
          </div>
        )}
      </div>

      {/* Right Sidebar: Control Rig - Fixed Overlay */}
      <div className={`fixed right-0 top-16 bottom-0 w-80 md:w-96 border-l-2 border-ink bg-paper flex flex-col z-40 shadow-2xl transition-transform duration-300 transform ${isSidebarVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          
          {/* Section: Configuration */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-ink pb-2">
               <h3 className="text-sm font-display font-bold uppercase flex items-center gap-2">
                 <Sliders size={16} /> Style Controls
               </h3>
               <button onClick={() => setShowSidebar(false)} className="text-ink hover:text-industrial-orange transition-colors">
                  <X size={20} />
               </button>
            </div>

            {/* Parametric Controls */}
            <div className="space-y-4 p-4 border border-ink bg-white relative">
              <div className="absolute top-0 left-0 bg-ink text-white text-[9px] px-1 font-mono">BLEND SETTINGS</div>
              <div className="flex justify-between text-xs font-mono font-bold mt-2">
                <span>BLEND_MIX</span>
                {selectedAuthors.length > 0 && (
                    <button onClick={resetToBaseline} title="Reset" className="text-industrial-orange hover:underline">
                        RESET
                    </button>
                )}
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1"
                value={settings.blendIntensity}
                onChange={(e) => setSettings({...settings, blendIntensity: parseFloat(e.target.value)})}
                className="w-full h-2 bg-industrial-gray rounded-none appearance-none cursor-pointer accent-industrial-orange"
              />
              <div className="flex justify-between text-[9px] font-mono text-industrial-dim uppercase">
                <span className={settings.blendIntensity < 0.5 ? 'text-ink font-bold' : ''}>Source</span>
                <span className={settings.blendIntensity >= 0.5 ? 'text-ink font-bold' : ''}>Target</span>
              </div>
            </div>

            <div className="space-y-2">
                <label className="text-xs font-mono font-bold uppercase">Tone Modulation</label>
                <div className="grid grid-cols-2 gap-2">
                {['Neutral', 'Formal', 'Casual', 'Poetic'].map((t) => {
                    const val = t === 'Neutral' ? 'neutral' : `more-${t.toLowerCase()}`;
                    return (
                    <button
                        key={t}
                        onClick={() => setSettings({...settings, toneShift: val as any})}
                        className={`text-[10px] font-mono font-bold uppercase py-2 px-2 border transition-all ${settings.toneShift === val ? 'bg-ink text-white border-ink' : 'bg-white border-ink text-ink hover:bg-industrial-gray/20'}`}
                    >
                        {t}
                    </button>
                    )
                })}
                </div>
            </div>
            
            {/* Primary Action Button */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating || selectedAuthors.length === 0 || (!content.trim() && !selection)}
                className={`w-full py-3 bg-industrial-orange hover:bg-ink text-white border-2 border-black font-mono font-bold uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:bg-industrial-gray disabled:shadow-none disabled:translate-x-0 disabled:translate-y-0 disabled:border-transparent disabled:cursor-not-allowed ${hasContent && hasAuthors && !isGenerating ? 'animate-pulse' : ''}`}
            >
                {isGenerating ? (
                    <><RefreshCw className="animate-spin" size={16} /> PROCESSING...</>
                ) : (
                    <><Wand2 size={16} /> {selection ? 'BLEND SELECTION' : 'BLEND DRAFT'}</>
                )}
            </button>
            {selectedAuthors.length === 0 && (
                <div className="flex items-center gap-2 text-[10px] font-mono text-industrial-orange bg-industrial-orange/5 p-2 border border-industrial-orange/20">
                    <Info size={12} />
                    <span>ERROR: NO TARGET SCRIBE SELECTED</span>
                </div>
            )}

            {/* Session Stats */}
            <div className="border border-ink bg-white p-3 space-y-3">
                <h4 className="text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 border-b border-ink/10 pb-2">
                   <BarChart3 size={12} /> Analytics
                </h4>
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-paper p-2 border border-ink/20">
                        <span className="block text-xl font-display font-bold text-ink">{stats.suggestionsGenerated}</span>
                        <span className="text-[9px] font-mono text-industrial-dim uppercase">OUTPUTS</span>
                    </div>
                    <div className="bg-paper p-2 border border-ink/20">
                        <span className="block text-xl font-display font-bold text-industrial-orange">{acceptanceRate}%</span>
                        <span className="text-[9px] font-mono text-industrial-dim uppercase">YIELD</span>
                    </div>
                </div>
            </div>

          </div>

          <div className="h-0.5 bg-ink w-full"></div>

          {/* Section: Authors Search & List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-display font-bold uppercase">
                  Target Scribes
                </h3>
                <span className="text-xs font-mono font-bold">{selectedAuthors.length}/2</span>
            </div>
            
            <div className="space-y-2">
                {/* Search Bar */}
                <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink" />
                    <input 
                        type="text" 
                        placeholder="SEARCH SCRIBE LIBRARY..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border-2 border-ink py-2 pl-9 pr-3 text-xs font-mono text-ink placeholder:text-industrial-dim focus:outline-none focus:border-industrial-orange transition-colors"
                    />
                </div>

                {/* Filter & Sort Controls */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => setHideUnselected(!hideUnselected)}
                        className={`text-[10px] font-mono font-bold uppercase flex items-center gap-1.5 px-2 py-1 border transition-colors ${hideUnselected ? 'bg-industrial-orange text-white border-industrial-orange' : 'bg-white border-ink text-ink hover:bg-industrial-gray/20'}`}
                    >
                        <Filter size={10} />
                        {hideUnselected ? 'Selection' : 'All Scribes'}
                    </button>

                    <div className="flex items-center gap-2 border border-ink bg-white px-2 py-1">
                        <ArrowDownAZ size={10} className="text-industrial-dim" />
                        <select 
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value as any)}
                            className="text-[10px] font-mono font-bold uppercase bg-transparent border-none outline-none text-ink cursor-pointer"
                        >
                            <option value="name">Name</option>
                            <option value="category">Category</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 pb-10">
              {filteredAuthors.length > 0 ? (
                  filteredAuthors.map(author => (
                    <AuthorCard 
                      key={author.id}
                      author={author}
                      isSelected={settings.targetAuthorIds.includes(author.id)}
                      onSelect={handleAuthorToggle}
                    />
                  ))
              ) : (
                  <div className="text-center py-6 space-y-3 border-2 border-dashed border-ink/20 bg-white">
                      {!hideUnselected ? (
                          <>
                              <p className="text-xs font-mono text-industrial-dim uppercase">
                                  Scribe Not Found.
                              </p>
                              
                              <div className="flex flex-col gap-3 max-w-[200px] mx-auto">
                                <button 
                                    onClick={handleAddPersona}
                                    disabled={isAddingPersona}
                                    className="w-full px-4 py-2 bg-paper border border-ink text-xs font-mono font-bold hover:bg-industrial-orange hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    {isAddingPersona ? (
                                        <><Loader2 size={12} className="animate-spin" /> ANALYZING...</>
                                    ) : (
                                        <><Plus size={12} /> GENERATE PROFILE</>
                                    )}
                                </button>
                                
                                <label className="flex items-center gap-2 justify-center text-[9px] font-mono text-ink cursor-pointer select-none opacity-80 hover:opacity-100">
                                  <input 
                                    type="checkbox" 
                                    checked={saveToLibrary}
                                    onChange={(e) => setSaveToLibrary(e.target.checked)}
                                    className="accent-industrial-orange w-3 h-3 border-ink rounded-none focus:ring-0"
                                  />
                                  SAVE TO LOCAL LIBRARY
                                </label>
                              </div>
                          </>
                      ) : (
                          <p className="text-xs font-mono text-industrial-dim uppercase">
                             No active scribes match filter.
                          </p>
                      )}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Overlay Panel */}
        {suggestions.length > 0 && (
          <div className="absolute inset-0 bg-paper z-40 flex flex-col animate-in slide-in-from-right duration-300 border-l-2 border-ink">
             <div className="p-4 border-b-2 border-ink flex justify-between items-center bg-white">
                <div>
                    <h3 className="font-display font-bold text-ink text-sm uppercase">Output Queue</h3>
                    <p className="text-[10px] font-mono text-industrial-dim uppercase">
                        {generationContext?.type === 'selection' ? 'PARTIAL REWRITE' : 'FULL REWRITE'}
                    </p>
                </div>
                <button onClick={() => setSuggestions([])} className="text-ink hover:text-red-500 transition-colors">
                  <X size={20} />
                </button>
             </div>
             <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-grid-pattern">
                {suggestions.map((s) => (
                  <div key={s.id} className="bg-white border-2 border-ink p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <div className="text-ink mb-4">
                      {s.rewrittenText.split('\n').map((paragraph, idx) => (
                        paragraph.trim() && (
                          <p key={idx} className="font-serif leading-relaxed text-sm mb-4 last:mb-0">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                    
                    <div className="bg-paper border border-ink p-3 mb-4">
                         <div className="flex items-center gap-2 mb-2">
                            <div className="h-2 flex-1 bg-industrial-gray border border-ink">
                                <div className="h-full bg-industrial-orange" style={{ width: `${s.similarityScore}%` }}></div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-ink">{s.similarityScore}% MATCH</span>
                         </div>
                         <div className="flex items-start gap-2">
                             <div className="mt-0.5 text-industrial-orange"><Settings size={10} /></div>
                             <p className="text-[10px] font-mono text-ink leading-tight uppercase">
                                {s.rationale}
                             </p>
                         </div>
                    </div>

                    <button 
                        onClick={() => applySuggestion(s.rewrittenText)}
                        className="w-full py-2 bg-ink text-white hover:bg-industrial-orange font-mono text-xs font-bold uppercase border border-transparent hover:border-black transition-colors flex items-center justify-center gap-2"
                    >
                        <Check size={14} /> Commit Changes
                    </button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Editor;