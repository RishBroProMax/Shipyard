"use client";

import { useState } from "react";
import { CheckCircle2, ChevronRight, Server, Globe, FolderGit2, Rocket, X } from "lucide-react";

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
      description: "Shipyard includes a built-in Local Node. You can also connect any remote VPS or PC.",
      actionLabel: "View Nodes or Add Server",
      action: onOpenConnectNode,
      icon: Server,
    },
    {
      id: 2,
      title: "Connect Git & Repository",
      description: "Deploy from any Git repository (GitHub, GitLab, or self-hosted Git).",
      actionLabel: "Configure Project",
      action: onOpenNewProject,
      icon: FolderGit2,
    },
    {
      id: 3,
      title: "Automated Routing & SSL",
      description: "Shipyard dynamically assigns collision-free ports (30000-39999) and reverse proxy routes.",
      actionLabel: "Learn More",
      action: () => setCurrentStep(4),
      icon: Globe,
    },
    {
      id: 4,
      title: "Deploy Your First Application",
      description: "Launch your application with zero post-deployment configuration.",
      actionLabel: "Deploy First App",
      action: onOpenNewProject,
      icon: Rocket,
    },
  ];

  return (
    <div className="mb-6 border border-zinc-800/90 bg-zinc-950/70 rounded-lg p-5 shadow-lg relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
              ZERO-CONFIG APPLIANCE
            </span>
            <h2 className="text-sm font-semibold text-zinc-100">Welcome to Shipyard PaaS</h2>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Follow this quick guide to deploy your first production workload in under 60 seconds.
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-zinc-500 hover:text-zinc-300 rounded"
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
              className={`p-3.5 rounded border transition-all cursor-pointer ${
                isActive
                  ? "bg-zinc-900 border-zinc-700 shadow-sm"
                  : isDone
                  ? "bg-zinc-950/40 border-zinc-800/60 opacity-80"
                  : "bg-zinc-950/20 border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <span className="text-[10px] font-mono text-zinc-500">0{step.id}</span>
                )}
              </div>
              <h3 className="text-xs font-semibold text-zinc-200">{step.title}</h3>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {step.description}
              </p>
              {isActive && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step.action();
                  }}
                  className="mt-3 w-full py-1.5 px-2 text-[11px] font-medium text-zinc-900 bg-zinc-200 hover:bg-white rounded flex items-center justify-center gap-1 transition-colors"
                >
                  <span>{step.actionLabel}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
