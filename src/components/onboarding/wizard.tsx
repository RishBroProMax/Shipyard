"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Server, Globe, FolderGit2, Rocket, X, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface OnboardingWizardProps {
  onOpenConnectNode: () => void;
  onOpenNewProject: () => void;
  onDismiss: () => void;
}

export function OnboardingWizard({
  onOpenConnectNode,
  onOpenNewProject,
  onDismiss,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    {
      id: 1,
      title: "Cluster Node Ready",
      description: "Shipyard includes a built-in Local Host Node with Docker socket integration.",
      actionLabel: "View Cluster Nodes",
      action: onOpenConnectNode,
      icon: Server,
    },
    {
      id: 2,
      title: "Select Starter or Git",
      description: "Deploy in 1-click from Next.js, FastAPI, Express, or any GitHub URL.",
      actionLabel: "Choose Template",
      action: onOpenNewProject,
      icon: FolderGit2,
    },
    {
      id: 3,
      title: "Automated Web Routing",
      description: "Dynamic Caddy reverse proxy assigns ports (30000-39999) with 0s downtime reload.",
      actionLabel: "Next Step",
      action: () => setCurrentStep(4),
      icon: Globe,
    },
    {
      id: 4,
      title: "Deploy & Monitor Live",
      description: "Stream real-time terminal build logs, inspect container CPU/RAM, and access your live URL.",
      actionLabel: "Deploy First App",
      action: onOpenNewProject,
      icon: Rocket,
    },
  ];

  return (
    <Card className="mb-6 p-5 relative overflow-hidden bg-gradient-to-r from-zinc-950 via-[#0d0e14] to-zinc-950 border-cyan-500/20 shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="cyan" className="font-mono text-[10px] tracking-wider">
              <Sparkles className="w-3 h-3 mr-1" />
              QUICKSTART APPLIANCE
            </Badge>
            <h2 className="text-sm font-bold text-white">Welcome to Shipyard PaaS (Vercel Lite)</h2>
          </div>
          <p className="text-xs text-zinc-400">
            Follow this 4-step workflow to compile, containerize, and route your first production service.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-zinc-500 hover:text-white rounded-lg transition-colors"
          title="Dismiss guide"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stepper Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div
              key={step.id}
              onClick={() => setCurrentStep(step.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isActive
                  ? "bg-zinc-900 border-cyan-500/60 shadow-md ring-1 ring-cyan-500/30"
                  : isDone
                  ? "bg-zinc-950/40 border-zinc-800/60 opacity-80"
                  : "bg-zinc-950/20 border-zinc-850 hover:border-zinc-750"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-850 border border-zinc-750 flex items-center justify-center text-cyan-400">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-[10px] font-mono font-semibold text-zinc-500">
                      0{step.id}
                    </span>
                  )}
                </div>
                <h3 className="text-xs font-bold text-white">{step.title}</h3>
                <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                  {step.description}
                </p>
              </div>

              {isActive && (
                <Button
                  size="sm"
                  variant="default"
                  onClick={(e) => {
                    e.stopPropagation();
                    step.action();
                  }}
                  className="mt-3 w-full py-1 text-xs h-7 gap-1"
                >
                  <span>{step.actionLabel}</span>
                  <ChevronRight className="w-3 h-3" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
