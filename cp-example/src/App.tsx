/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import Logo from "./components/Logo";
import { MapPin, MessageSquare, ThumbsUp, Send, Plus, Minus } from "lucide-react";

export default function App() {
  const ideas = [
    {
      id: 1,
      neighborhood: "Mănăștur",
      status: "În Analiză",
      title: "Reabilitarea Parcului Colina: Zonă de fitness și relaxare",
      support: 452,
      comments: 24,
      color: "text-teal-600"
    },
    {
      id: 2,
      neighborhood: "Gheorgheni",
      status: "Implementare",
      title: "Pistă de biciclete securizată pe strada Unirii",
      support: 1208,
      comments: 56,
      color: "text-blue-600"
    },
    {
      id: 3,
      neighborhood: "Zorilor",
      status: "Propusă",
      title: "Stații de autobuz inteligente cu panouri solare",
      support: 189,
      comments: 12,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="h-screen w-full bg-paper text-ink font-sans flex flex-col overflow-hidden border-8 border-white">
      {/* Header */}
      <header className="flex items-end justify-between px-10 pt-8 pb-6 border-b border-ink/10 shrink-0">
        <Logo size={48} />
        <nav className="hidden md:flex gap-8 text-[11px] font-bold tracking-widest uppercase mb-1">
          <a href="#" className="border-b-2 border-ink">Proiecte</a>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Hartă</a>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Rezultate</a>
          <a href="#" className="opacity-40 hover:opacity-100 transition-opacity">Despre</a>
        </nav>
      </header>

      {/* Main Layout */}
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar: Idea Feed */}
        <section className="w-[400px] border-r border-ink/10 p-10 flex flex-col gap-8 overflow-hidden bg-white/50 backdrop-blur-sm">
          <div className="flex justify-between items-baseline shrink-0">
            <h2 className="text-3xl font-serif italic tracking-tight">Ultimele Idei</h2>
            <span className="text-[10px] font-bold px-2 py-1 bg-ink text-paper rounded uppercase tracking-wider animate-pulse">LIVE</span>
          </div>

          <div className="flex flex-col gap-10 overflow-y-auto pr-2 custom-scrollbar">
            {ideas.map((idea, index) => (
              <motion.div 
                key={idea.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${idea.color}`}>{idea.neighborhood}</span>
                  <span className="w-1 h-1 bg-ink/20 rounded-full"></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-40">{idea.status}</span>
                </div>
                <h3 className="text-xl font-serif font-medium leading-tight group-hover:underline underline-offset-8 decoration-1 mb-3 transition-all">
                  {idea.title}
                </h3>
                <div className="flex items-center gap-5 text-[11px] font-bold uppercase tracking-widest opacity-80">
                  <span className="flex items-center gap-1.5"><ThumbsUp size={12} strokeWidth={3} /> {idea.support}</span>
                  <span className="flex items-center gap-1.5 opacity-40"><MessageSquare size={12} strokeWidth={3} /> {idea.comments}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mt-auto w-full py-5 bg-ink text-paper text-[12px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <Send size={14} /> Trimite Ideea Ta
          </motion.button>
        </section>

        {/* Right: Map View Container */}
        <section className="flex-1 bg-[#F5F3F0] p-10 flex flex-col overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex-1 bg-white border border-ink/5 shadow-2xl relative overflow-hidden ring-1 ring-ink/5"
          >
            {/* Mock Map Background */}
            <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
               <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full stroke-ink fill-none stroke-[0.2]">
                 <path d="M0,20 Q40,10 60,40 T100,50 M30,0 L30,100 M70,0 L70,100 M0,60 L100,60 M10,10 L90,90" />
               </svg>
            </div>
            
            {/* Map Pins */}
            <div className="absolute top-1/4 left-1/3 group cursor-pointer">
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-4 h-4 bg-teal-600 rounded-full ring-8 ring-teal-600/10"
              />
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink text-paper text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Parcul Central</div>
            </div>

            <div className="absolute top-2/3 right-1/4 group cursor-pointer">
              <div className="w-4 h-4 bg-ink rounded-full ring-8 ring-ink/10"></div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink text-paper text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Grădina Botanică</div>
            </div>

            <div className="absolute bottom-1/4 left-1/2 group cursor-pointer">
              <div className="w-4 h-4 bg-teal-600 rounded-full ring-8 ring-teal-600/10 animate-pulse"></div>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-ink text-paper text-[9px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">Campus Zorilor</div>
            </div>

            {/* Map UI Elements */}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
              <div className="bg-white border border-ink/10 p-2 shadow-sm font-bold text-[10px] text-center w-8 cursor-pointer hover:bg-slate-50 transition-colors"><Plus size={14} /></div>
              <div className="bg-white border border-ink/10 p-2 shadow-sm font-bold text-[10px] text-center w-8 cursor-pointer hover:bg-slate-50 transition-colors"><Minus size={14} /></div>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-white/90 backdrop-blur-md border border-ink/10 p-8 shadow-xl flex items-center justify-between"
              >
                <div>
                  <h4 className="font-serif text-2xl italic tracking-tight">Explorați Clujul prin idei</h4>
                  <p className="text-[11px] opacity-60 uppercase font-bold tracking-[0.2em] mt-1 shrink-0">1,402 proiecte active în toate cartierele</p>
                </div>
                <div className="flex -space-x-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white bg-zinc-200" />
                  ))}
                  <div className="w-12 h-12 rounded-full border-2 border-white bg-ink flex items-center justify-center text-[10px] text-paper font-bold tracking-tighter shrink-0 ring-4 ring-ink/5">
                    +8k
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>
      </main>

      {/* Footer/Ticker */}
      <footer className="bg-ink text-paper h-12 flex items-center px-10 overflow-hidden relative shrink-0">
        <motion.div 
          animate={{ x: [0, -1000] }}
          transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
          className="flex items-center gap-20 whitespace-nowrap"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Buget participativ 2024: În desfășurare</span>
          </div>
          <div className="text-[10px] font-medium opacity-50 uppercase tracking-[0.2em]">
            Ultima actualizare: Reabilitare str. Kogălniceanu (95% complet)
          </div>
          <div className="text-[10px] font-medium opacity-50 uppercase tracking-[0.2em]">
            S-au adunat 45,000 de voturi luna aceasta
          </div>
          <div className="text-[10px] font-medium opacity-50 uppercase tracking-[0.2em]">
            Proiect nou în Mărăști: Centru comunitar multifuncțional
          </div>
          {/* Repeat for seamless ticker if needed */}
        </motion.div>
        <div className="absolute right-10 flex gap-4 bg-ink pl-10 h-full items-center">
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] cursor-pointer">RO</span>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-30 cursor-pointer">EN</span>
        </div>
      </footer>
    </div>
  );
}
