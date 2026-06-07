"use client";

import React, { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { translations } from '@/lib/translations';
import { 
  Scale, 
  FileText, 
  BarChart4, 
  Users, 
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

type Task = {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  color: string;
};

type TaskCatalogProps = {
  onSelectTask: (taskId: string) => void;
};

export function TaskCatalog({ onSelectTask }: TaskCatalogProps) {
  const { language } = useLanguage();
  const t = translations[language];
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const tasks: Task[] = [
    { 
      id: 'contract', 
      name: t.task1Name, 
      desc: t.task1Desc, 
      icon: <Scale className="w-6 h-6" />, 
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20" 
    },
    { 
      id: 'compare', 
      name: t.task2Name, 
      desc: t.task2Desc, 
      icon: <FileText className="w-6 h-6" />, 
      color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
    },
    { 
      id: 'finance', 
      name: t.task3Name, 
      desc: t.task3Desc, 
      icon: <BarChart4 className="w-6 h-6" />, 
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20" 
    },
    { 
      id: 'recruitment', 
      name: t.task4Name, 
      desc: t.task4Desc, 
      icon: <Users className="w-6 h-6" />, 
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20" 
    },
  ];

  return (
    <section id="catalog" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
            {t.tasksTitle}
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            {t.tasksSub}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {tasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => setSelectedTask(task)}
              className="group relative bg-slate-900/40 border border-white/5 p-8 rounded-[2rem] hover:bg-slate-900/60 hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden"
            >
              {/* Decorative gradient */}
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-colors" />
              
              <div className={`w-14 h-14 rounded-2xl ${task.color} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {task.icon}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">
                  {task.name}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2">
                  {task.desc}
                </p>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <span className="text-xs font-bold text-primary uppercase tracking-widest">$10 USD</span>
                <div className="flex items-center gap-2 text-primary font-bold text-sm">
                  {t.details}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Detail Modal */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="bg-slate-900 border-white/10 text-white rounded-[2rem] max-w-md p-8">
          <DialogHeader>
            <div className={`w-16 h-16 rounded-2xl ${selectedTask?.color} border flex items-center justify-center mb-4 mx-auto`}>
              {selectedTask?.icon}
            </div>
            <DialogTitle className="text-2xl font-bold text-center text-white">
              {selectedTask?.name}
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-center text-base pt-4">
              {selectedTask?.desc}
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-2">
            <span className="text-3xl font-bold text-white">$10 <span className="text-sm font-normal text-slate-500">USD / run</span></span>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-widest">
              <Info className="w-3 h-3" />
              Entrenado por Expertos Reales
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button 
              onClick={() => {
                const taskId = selectedTask?.id;
                setSelectedTask(null);
                if (taskId) onSelectTask(taskId);
              }}
              className="w-full h-14 rounded-full bg-primary text-background font-bold text-lg hover:bg-primary/90 transition-all active:scale-95"
            >
              {t.startNow}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
