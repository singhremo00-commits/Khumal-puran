import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Globe, Book, Volume2, Moon, Sun, ChevronLeft, ChevronRight, Search, Copy, Bookmark, BookmarkCheck, X, Loader2, Menu, HelpCircle } from 'lucide-react';
import { cn, Language, CHAPTERS, PuranContent, FAQ_DATA, FAQItem } from './types';
import { GoogleGenAI, Modality } from "@google/genai";

const MandalaBorder = () => (
  <div className="fixed inset-0 pointer-events-none z-50 p-4">
    <div className="w-full h-full border border-gold/30 rounded-sm relative">
      {/* Corner Ornaments */}
      {[0, 90, 180, 270].map((rotation) => (
        <div
          key={rotation}
          className="absolute w-16 h-16"
          style={{
            top: rotation < 180 ? -8 : 'auto',
            bottom: rotation >= 180 ? -8 : 'auto',
            left: rotation === 0 || rotation === 270 ? -8 : 'auto',
            right: rotation === 90 || rotation === 180 ? -8 : 'auto',
            transform: `rotate(${rotation}deg)`,
          }}
        >
          <svg viewBox="0 0 100 100" className="w-full h-full text-gold fill-none stroke-current stroke-[2]">
            <path d="M 0 50 A 50 50 0 0 1 50 0" />
            <circle cx="50" cy="50" r="10" className="fill-gold/20" />
            <path d="M 20 20 L 40 40 M 10 30 L 30 10" />
          </svg>
        </div>
      ))}
    </div>
  </div>
);

const LanguageToggle = ({ current, onSelect }: { current: Language, onSelect: (l: Language) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  const options: { id: Language; label: string }[] = [
    { id: 'english', label: 'EN' },
    { id: 'bangla', label: 'BN' },
    { id: 'hinglish', label: 'HG' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 bg-white/10 dark:bg-obsidian/40 backdrop-blur-md rounded-full border border-gold/30 flex items-center justify-center text-gold shadow-lg hover:scale-110 transition-transform"
      >
        <Globe size={18} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-12 right-0 bg-white dark:bg-obsidian border border-gold/30 rounded-xl shadow-2xl overflow-hidden min-w-[80px] z-[70]"
          >
            {options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  onSelect(opt.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-4 py-3 text-sm font-medium transition-colors hover:bg-gold/10",
                  current === opt.id ? "text-gold bg-gold/5" : "text-black dark:text-white"
                )}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ChapterWheel = ({ current, onSelect }: { current: number, onSelect: (id: number) => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative flex items-center justify-center">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute bottom-16 left-0 w-64 h-64 rounded-full border-2 border-gold/20 flex items-center justify-center"
            style={{ transform: 'translateX(-25%)' }}
          >
            {CHAPTERS.map((ch, idx) => {
              const angle = (idx / CHAPTERS.length) * 360 - 90;
              const radius = 100;
              const x = Math.cos((angle * Math.PI) / 180) * radius;
              const y = Math.sin((angle * Math.PI) / 180) * radius;

              return (
                <motion.button
                  key={ch.chapter_id}
                  onClick={() => {
                    onSelect(ch.chapter_id);
                    setIsOpen(false);
                  }}
                  whileHover={{ scale: 1.2 }}
                  className={cn(
                    "absolute w-8 h-8 rounded-full border border-gold/50 flex items-center justify-center text-[10px] font-bold transition-all",
                    current === ch.chapter_id 
                      ? "bg-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.5)]" 
                      : "bg-white dark:bg-obsidian text-gold"
                  )}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                >
                  {ch.chapter_id}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-110 transition-transform z-10"
      >
        <Book size={20} />
      </button>
    </div>
  );
};

const FAQModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-obsidian border border-gold/30 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-bottom border-gold/20 flex items-center justify-between bg-gold/5">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-gold" size={24} />
                <h2 className="text-2xl font-sans font-bold text-white">Detailed FAQ</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gold/10 rounded-full text-gold transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {FAQ_DATA.map((item, idx) => (
                <div key={idx} className="space-y-3 group">
                  <h3 className="text-lg font-sans text-gold font-bold leading-tight group-hover:text-white transition-colors">
                    {item.question}
                  </h3>
                  <p className="text-white/70 leading-relaxed font-sans text-sm md:text-base">
                    {item.answer}
                  </p>
                  <div className="h-px w-full bg-gold/10" />
                </div>
              ))}
            </div>

            <div className="p-4 bg-gold/5 text-center text-xs text-gold/50 uppercase tracking-widest font-sans">
              Khumal Puran Digital Edition
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const HamburgerMenu = ({ onOpenFAQ, onOpenAbout, onOpenSupport }: { onOpenFAQ: () => void, onOpenAbout: () => void, onOpenSupport: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-6 right-6 z-[60]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-12 h-12 bg-obsidian/80 backdrop-blur-md rounded-full border border-gold/30 flex items-center justify-center text-gold shadow-lg hover:scale-110 transition-transform"
      >
        <Menu size={24} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: 20, y: -20 }}
              className="absolute top-14 right-0 bg-obsidian border border-gold/30 rounded-2xl shadow-2xl overflow-hidden min-w-[200px]"
            >
              <button
                onClick={() => {
                  onOpenFAQ();
                  setIsOpen(false);
                }}
                className="w-full px-6 py-4 text-left flex items-center gap-3 text-white hover:bg-gold/10 transition-colors"
              >
                <HelpCircle size={20} className="text-gold" />
                <span className="font-sans">Detailed FAQ</span>
              </button>
              <div className="h-px bg-gold/10 mx-4" />
              <button
                onClick={() => {
                  onOpenAbout();
                  setIsOpen(false);
                }}
                className="w-full px-6 py-4 text-left flex items-center gap-3 text-white hover:bg-gold/10 transition-colors"
              >
                <Book size={20} className="text-gold" />
                <span className="font-sans">About</span>
              </button>
              <div className="h-px bg-gold/10 mx-4" />
              <button
                onClick={() => {
                  onOpenSupport();
                  setIsOpen(false);
                }}
                className="w-full px-6 py-4 text-left flex items-center gap-3 text-white hover:bg-gold/10 transition-colors"
              >
                <Globe size={20} className="text-gold" />
                <span className="font-sans">Support</span>
              </button>
              <div className="h-px bg-gold/10 mx-4" />
              <div className="px-6 py-4 text-[10px] text-gold/40 uppercase tracking-widest font-sans">
                Khumal Puran v1.0
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<Language>('english');
  const [chapterId, setChapterId] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState<number[]>([]);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isFAQOpen, setIsFAQOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const currentChapter = CHAPTERS.find(c => c.chapter_id === chapterId) || CHAPTERS[0];

  const stopAudio = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      audioSourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setIsAudioPlaying(false);
  };

  const handleSpeak = async () => {
    if (isAudioPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsAudioLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-2.5-flash-preview-tts";
      
      const textToSpeak = currentChapter.content[lang];
      const prompt = lang === 'bangla' 
        ? `Read this Bengali text clearly and naturally: ${textToSpeak}`
        : lang === 'hinglish'
        ? `Read this Hinglish text clearly and naturally: ${textToSpeak}`
        : `Read this English text clearly and naturally: ${textToSpeak}`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const binaryString = atob(base64Audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
        });
        audioContextRef.current = audioContext;

        // The data is raw PCM 16-bit Little Endian
        const pcmData = new Int16Array(bytes.buffer);
        const audioBuffer = audioContext.createBuffer(1, pcmData.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < pcmData.length; i++) {
          channelData[i] = pcmData[i] / 32768.0;
        }

        const source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        audioSourceRef.current = source;
        
        source.onended = () => {
          setIsAudioPlaying(false);
        };

        source.start(0);
        setIsAudioPlaying(true);
      }
    } catch (error) {
      console.error("TTS Error:", error);
      alert("Failed to generate audio. Please check your connection and try again.");
    } finally {
      setIsAudioLoading(false);
    }
  };

  useEffect(() => {
    stopAudio();
  }, [chapterId, lang]);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('khumel_bookmarks');
      if (saved) setBookmarks(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load bookmarks", e);
    }
  }, []);

  const toggleBookmark = (id: number) => {
    const newBookmarks = bookmarks.includes(id) 
      ? bookmarks.filter(b => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    localStorage.setItem('khumel_bookmarks', JSON.stringify(newBookmarks));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentChapter.content[lang]);
    setShowCopyToast(true);
    setTimeout(() => setShowCopyToast(false), 2000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-8 transition-colors duration-700 bg-paper-texture dark">
      <MandalaBorder />
      <HamburgerMenu 
        onOpenFAQ={() => setIsFAQOpen(true)} 
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
      />
      <FAQModal isOpen={isFAQOpen} onClose={() => setIsFAQOpen(false)} />
      
      {/* About Modal */}
      <AnimatePresence>
        {isAboutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-obsidian border border-gold/30 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative"
            >
              <button onClick={() => setIsAboutOpen(false)} className="absolute top-4 right-4 text-gold hover:scale-110 transition-transform">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-sans font-bold text-gold mb-6">About Khumal Puran</h2>
              <p className="text-white/80 leading-relaxed font-sans mb-4">
                Khumal Puran is a sacred text detailing the ancient history and divine lineage of the Khumal clan in the Manipur Valley.
              </p>
              <p className="text-white/80 leading-relaxed font-sans">
                This digital edition aims to preserve and share this rich cultural heritage with the world.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-obsidian border border-gold/30 rounded-2xl w-full max-w-lg p-8 shadow-2xl relative"
            >
              <button onClick={() => setIsSupportOpen(false)} className="absolute top-4 right-4 text-gold hover:scale-110 transition-transform">
                <X size={24} />
              </button>
              <h2 className="text-3xl font-sans font-bold text-gold mb-6">Support</h2>
              <p className="text-white/80 leading-relaxed font-sans mb-4">
                For any queries, feedback, or support regarding this application, please reach out to us.
              </p>
              <div className="bg-gold/10 p-4 rounded-xl border border-gold/20">
                <p className="text-gold font-medium">Email: support@khumalpuran.org</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <main className="max-w-5xl w-full relative z-10 text-center pb-40 px-4 md:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${chapterId}-${lang}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <span className="text-gold font-medium tracking-[0.3em] uppercase text-sm">
                Chapter {currentChapter.chapter_id}
              </span>
              
              {chapterId === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4 mb-8"
                >
                  <h1 className="text-3xl md:text-5xl font-sans font-bold text-white leading-tight">
                    Khumal Puran
                  </h1>
                </motion.div>
              )}

              <div className="w-24 h-1 bg-gold/30 mx-auto rounded-full mt-4" />
              <h2 className="text-xl md:text-2xl font-sans font-bold text-white mt-8">
                {currentChapter.verse_title}
              </h2>
            </div>

            <div className="relative px-2 md:px-4 group">
              <div className={cn(
                "text-lg md:text-xl leading-relaxed text-white/90 font-sans text-left",
                lang === 'bangla' ? "not-italic" : ""
              )}>
                <div className="markdown-body">
                  <Markdown>{currentChapter.content[lang]}</Markdown>
                </div>
              </div>
              
              {/* Decorative Quotes */}
              <div className="absolute -top-8 left-0 text-6xl text-gold/20 font-sans">"</div>
              <div className="absolute -bottom-8 right-0 text-6xl text-gold/20 font-sans">"</div>

              {/* Action Buttons */}
              <div className="absolute -right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={copyToClipboard}
                  className="p-3 bg-white dark:bg-obsidian border border-gold/30 rounded-full text-gold shadow-xl hover:scale-110 transition-transform"
                  title="Copy Verse"
                >
                  <Copy size={20} />
                </button>
                <button
                  onClick={() => toggleBookmark(chapterId)}
                  className="p-3 bg-white dark:bg-obsidian border border-gold/30 rounded-full text-gold shadow-xl hover:scale-110 transition-transform"
                  title="Bookmark"
                >
                  {bookmarks.includes(chapterId) ? <BookmarkCheck size={20} /> : <Bookmark size={20} />}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Fixed Bottom Footer Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 z-[60] px-6 pb-6 pt-2 bg-gradient-to-t from-black via-black/90 to-transparent">
        <div className="max-w-md mx-auto flex items-center justify-between bg-white/5 backdrop-blur-xl border border-gold/20 rounded-full px-4 py-2 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
          <div className="flex items-center gap-3">
            <ChapterWheel current={chapterId} onSelect={setChapterId} />
            <button
              onClick={handleSpeak}
              disabled={isAudioLoading}
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                isAudioPlaying ? "bg-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.4)]" : "text-gold hover:bg-gold/10",
                isAudioLoading ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              {isAudioLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Volume2 size={18} />
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              disabled={chapterId === 1}
              onClick={() => setChapterId(prev => Math.max(1, prev - 1))}
              className="p-2 text-gold hover:bg-gold/10 rounded-full disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              disabled={chapterId === CHAPTERS.length}
              onClick={() => setChapterId(prev => Math.min(CHAPTERS.length, prev + 1))}
              className="p-2 text-gold hover:bg-gold/10 rounded-full disabled:opacity-20 transition-all hover:scale-110 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <LanguageToggle current={lang} onSelect={setLang} />
        </div>
      </footer>

      {/* Copy Toast */}
      <AnimatePresence>
        {showCopyToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 bg-gold text-white px-6 py-2 rounded-full shadow-2xl z-[100] font-medium"
          >
            Verse copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Mandala Decoration */}
      <div className="fixed -bottom-32 -right-32 w-96 h-96 text-gold/5 pointer-events-none animate-rotate-slow">
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>
      <div className="fixed -top-32 -left-32 w-96 h-96 text-gold/5 pointer-events-none animate-rotate-slow" style={{ animationDirection: 'reverse' }}>
        <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
          <path d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" />
          <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
}
