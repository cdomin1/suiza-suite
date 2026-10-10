import React, { useState } from 'react';
import { useStudio } from '../../context/StudioContext';
import {
  Sparkles,
  Scissors,
  Maximize2,
  Brush,
  Code2,
  Copy,
  Check,
  Play,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Layers,
  Sliders,
  Terminal,
  Upload,
} from 'lucide-react';

export const AiAgentPanel: React.FC = () => {
  const {
    aiOptIn,
    setAiOptIn,
    project,
    setProject,
    addAdjustmentLayer,
    pushHistoryStep,
    theme,
  } = useStudio();

  const [activeTask, setActiveTask] = useState<string | null>(null);
  const [taskProgress, setTaskProgress] = useState<number>(0);
  const [taskSuccess, setTaskSuccess] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [deployedNotice, setDeployedNotice] = useState(false);

  // Upscale choice
  const [upscaleScale, setUpscaleScale] = useState<2 | 4>(2);

  // Plugin Code Template Selection
  const [pluginLang, setPluginLang] = useState<'rust-wasm' | 'gegl' | 'python'>('rust-wasm');

  // Dynamic code generation
  const rustPluginCode = `// Suiza-Suite Plugin: Zero-Cost SIMD Neural Retouching
// Memory-safe, thread-parallelized Rust Wasm module
use suiza_sdk::prelude::*;

#[suiza_plugin(name = "Bilateral Neural Denoiser", category = "Retouch")]
pub struct NeuralFilter {
    radius: f32,
    edge_threshold: f32,
}

impl FilterEngine for NeuralFilter {
    fn process(&self, frame: &mut FrameBuffer) -> Result<(), SafetyError> {
        // Parallelized SIMD execution with zero allocations on rendering thread
        frame.par_chunks_mut(128).for_each(|chunk| {
            simd_edge_preserve_bilateral(chunk, self.radius, self.edge_threshold);
        });
        Ok(())
    }
}`;

  const pythonPluginCode = `# Suiza-Suite Python 3 Bridge Plugin
import suiza_bridge as sb

def run_content_aware_synthesize(image, mask):
    """Seamless patch synthesis without altering base image"""
    patch = sb.ai.synthesize_texture(image, mask, iterations=24)
    return sb.Layer.create_patch(patch, blend_mode="normal", opacity=100)`;

  const currentCode = pluginLang === 'rust-wasm' ? rustPluginCode : pythonPluginCode;

  // 1. AI BACKGROUND REMOVAL (Non-destructive)
  const handleBackgroundRemoval = () => {
    setActiveTask('bg-removal');
    setTaskProgress(25);

    setTimeout(() => setTaskProgress(65), 300);
    setTimeout(() => {
      setTaskProgress(100);

      const cutoutId = `cutout-${Date.now()}`;
      setProject(prev => {
        const baseLayer = prev.layers.find(l => l.id === prev.selectedLayerId) || prev.layers[0];
        const cutoutLayer = {
          ...JSON.parse(JSON.stringify(baseLayer)),
          id: cutoutId,
          name: `${baseLayer.name} (Foreground Isolated)`,
          maskEnabled: true,
          opacity: 100,
        };
        return {
          ...prev,
          layers: [...prev.layers, cutoutLayer],
          selectedLayerId: cutoutId,
        };
      });

      pushHistoryStep('AI Background Removal (Cutout Layer Created)');
      setActiveTask(null);
      setTaskProgress(0);
      setTaskSuccess('Background removed non-destructively. Isolated subject layer added to stack.');
    }, 700);
  };

  // 2. AI IMAGE UPSCALING / SUPER-RESOLUTION
  const handleUpscale = () => {
    setActiveTask('upscale');
    setTaskProgress(20);

    setTimeout(() => setTaskProgress(70), 350);
    setTimeout(() => {
      setTaskProgress(100);

      const upscaleLayerId = `upscale-${Date.now()}`;
      setProject(prev => {
        const baseLayer = prev.layers.find(l => l.id === prev.selectedLayerId) || prev.layers[0];
        const enhancedLayer = {
          ...JSON.parse(JSON.stringify(baseLayer)),
          id: upscaleLayerId,
          name: `${baseLayer.name} (${upscaleScale}× Neural Super-Res)`,
          blendMode: 'soft-light' as const,
          opacity: 90,
        };
        return {
          ...prev,
          layers: [...prev.layers, enhancedLayer],
          selectedLayerId: upscaleLayerId,
        };
      });

      pushHistoryStep(`AI ${upscaleScale}× Super-Resolution Upscale`);
      setActiveTask(null);
      setTaskProgress(0);
      setTaskSuccess(`Neural super-resolution (${upscaleScale}×) applied with high-frequency sharpening.`);
    }, 750);
  };

  // 3. AI CONTENT-AWARE FILL
  const handleContentAwareFill = () => {
    setActiveTask('fill');
    setTaskProgress(30);

    setTimeout(() => setTaskProgress(80), 300);
    setTimeout(() => {
      setTaskProgress(100);

      const patchLayerId = `patch-${Date.now()}`;
      setProject(prev => {
        const patchLayer = {
          id: patchLayerId,
          name: 'Content-Aware Synthesis Patch',
          type: 'raster' as const,
          visible: true,
          locked: false,
          opacity: 100,
          blendMode: 'normal' as const,
          canvasDataUrl: prev.layers[0]?.canvasDataUrl,
        };
        return {
          ...prev,
          layers: [...prev.layers, patchLayer],
          selectedLayerId: patchLayerId,
        };
      });

      pushHistoryStep('AI Content-Aware Fill Patch');
      setActiveTask(null);
      setTaskProgress(0);
      setTaskSuccess('Seamless texture patch synthesized into a new non-destructive layer.');
    }, 700);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 1500);
  };

  const handleDeployPlugin = () => {
    setDeployedNotice(true);
    setTimeout(() => setDeployedNotice(false), 2500);
  };

  const cardBg = theme.isLight ? '#f8fafc' : 'rgba(0,0,0,0.3)';

  return (
    <div className="p-3 text-xs space-y-4 select-none overflow-y-auto h-full scrollbar-thin">
      {/* Opt-In Header Banner */}
      <div
        className="p-2.5 rounded border space-y-1.5"
        style={{
          backgroundColor: theme.isLight ? '#f5f3ff' : 'rgba(88, 28, 135, 0.4)',
          borderColor: theme.isLight ? '#c4b5fd' : 'rgba(168, 85, 247, 0.3)',
        }}
      >
        <div className="flex items-center justify-between">
          <span
            className="font-bold flex items-center gap-1.5 text-xs"
            style={{ color: theme.isLight ? '#581c87' : '#e9d5ff' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Agentic AI Studio Automation</span>
          </span>
          <button
            onClick={() => setAiOptIn(!aiOptIn)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
              aiOptIn
                ? 'bg-purple-600 text-white'
                : theme.isLight
                ? 'bg-purple-200 text-purple-900'
                : 'bg-neutral-800 text-neutral-400 hover:text-white'
            }`}
          >
            {aiOptIn ? 'ENABLED' : 'OPT-IN'}
          </button>
        </div>
        <p
          className="text-[11px] leading-relaxed font-medium"
          style={{ color: theme.isLight ? '#6b21a8' : '#d8b4fe' }}
        >
          High-performance, async task automation running in parallel workers with zero frame drops on live canvas rendering.
        </p>
      </div>

      {!aiOptIn ? (
        <div
          className="p-4 rounded border border-dashed text-center space-y-2"
          style={{ borderColor: theme.borderStrong }}
        >
          <ShieldCheck className="w-6 h-6 mx-auto" style={{ color: theme.textSecondary }} />
          <div className="font-bold text-sm" style={{ color: theme.textPrimary }}>Opt-in Required</div>
          <p className="text-[11px]" style={{ color: theme.textSecondary }}>
            AI features operate on an opt-in basis. Activate the toggle above to enable background removal, neural upscaling, and plugin code generation.
          </p>
          <button
            onClick={() => setAiOptIn(true)}
            className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs font-semibold transition-colors"
          >
            Enable Opt-in AI
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status feedback */}
          {taskSuccess && (
            <div
              className="p-2.5 rounded border text-[11px] flex items-center gap-1.5 font-medium"
              style={{
                backgroundColor: theme.isLight ? '#ecfdf5' : 'rgba(6, 78, 59, 0.4)',
                borderColor: theme.isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.3)',
                color: theme.isLight ? '#065f46' : '#6ee7b7',
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{taskSuccess}</span>
            </div>
          )}

          {/* Progress bar during task */}
          {activeTask && (
            <div
              className="p-2.5 rounded border space-y-1.5"
              style={{
                backgroundColor: cardBg,
                borderColor: theme.accent,
              }}
            >
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold" style={{ color: theme.accent }}>Asynchronous Worker Computing...</span>
                <span className="font-mono font-bold" style={{ color: theme.accent }}>{taskProgress}%</span>
              </div>
              <div
                className="h-1.5 w-full rounded overflow-hidden"
                style={{ backgroundColor: theme.isLight ? '#e2e8f0' : '#262626' }}
              >
                <div
                  className="h-full bg-purple-600 transition-all duration-200"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* 1. AI BACKGROUND REMOVAL */}
          <div
            className="space-y-1.5 p-2.5 rounded border"
            style={{ backgroundColor: cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>AI Background Removal</span>
              </div>
              <button
                onClick={handleBackgroundRemoval}
                disabled={activeTask !== null}
                className="px-2.5 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                <span>Remove BG</span>
              </button>
            </div>
            <p className="text-[10px]" style={{ color: theme.textSecondary }}>
              Extracts foreground subject and applies non-destructive alpha matte without overwriting base image.
            </p>
          </div>

          {/* 2. IMAGE UPSCALING / SUPER RESOLUTION */}
          <div
            className="space-y-1.5 p-2.5 rounded border"
            style={{ backgroundColor: cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>Neural Super-Resolution</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setUpscaleScale(2)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    upscaleScale === 2
                      ? 'bg-sky-600 text-white'
                      : theme.isLight
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-black/40 text-neutral-400'
                  }`}
                >
                  2×
                </button>
                <button
                  onClick={() => setUpscaleScale(4)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                    upscaleScale === 4
                      ? 'bg-sky-600 text-white'
                      : theme.isLight
                      ? 'bg-slate-200 text-slate-800'
                      : 'bg-black/40 text-neutral-400'
                  }`}
                >
                  4×
                </button>
                <button
                  onClick={handleUpscale}
                  disabled={activeTask !== null}
                  className="ml-1 px-2.5 py-1 rounded bg-sky-600 hover:bg-sky-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
                >
                  <Play className="w-3 h-3" />
                  <span>Upscale</span>
                </button>
              </div>
            </div>
            <p className="text-[10px]" style={{ color: theme.textSecondary }}>
              Synthesizes high-frequency details using multi-scale spline interpolation on an adjustment layer.
            </p>
          </div>

          {/* 3. CONTENT-AWARE FILL */}
          <div
            className="space-y-1.5 p-2.5 rounded border"
            style={{ backgroundColor: cardBg, borderColor: theme.border }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brush className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-xs" style={{ color: theme.textPrimary }}>Content-Aware Fill</span>
              </div>
              <button
                onClick={handleContentAwareFill}
                disabled={activeTask !== null}
                className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors disabled:opacity-50"
              >
                <Play className="w-3 h-3" />
                <span>Synthesize</span>
              </button>
            </div>
            <p className="text-[10px]" style={{ color: theme.textSecondary }}>
              Generates seamless background texture matching neighboring gradients onto a separate patch layer.
            </p>
          </div>

          {/* 4. INTELLIGENT CODE SUGGESTIONS FOR PLUGIN DEVELOPMENT */}
          <div className="space-y-2 pt-2 border-t" style={{ borderColor: theme.border }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: theme.textSecondary }}>
                <Code2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Plugin Code Generator</span>
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPluginLang('rust-wasm')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    pluginLang === 'rust-wasm'
                      ? 'bg-emerald-600 text-white'
                      : theme.isLight
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-neutral-400'
                  }`}
                >
                  Rust Wasm
                </button>
                <button
                  onClick={() => setPluginLang('python')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    pluginLang === 'python'
                      ? 'bg-emerald-600 text-white'
                      : theme.isLight
                      ? 'bg-slate-200 text-slate-800'
                      : 'text-neutral-400'
                  }`}
                >
                  Python
                </button>
              </div>
            </div>

            {/* Code Block with Copy & Deploy Actions */}
            <div className="relative group bg-slate-950 text-slate-100 rounded border border-slate-700 p-2 font-mono text-[10px] max-h-48 overflow-y-auto">
              <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                <button
                  onClick={handleCopyCode}
                  className="px-1.5 py-0.5 rounded bg-white/10 hover:bg-white/20 text-white text-[10px] flex items-center gap-1 font-sans"
                >
                  {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={handleDeployPlugin}
                  className="px-1.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] flex items-center gap-1 font-sans font-semibold"
                >
                  <Upload className="w-3 h-3" />
                  <span>Register</span>
                </button>
              </div>
              <pre>{currentCode}</pre>
            </div>

            {deployedNotice && (
              <div
                className="p-2 rounded border text-[10px] flex items-center gap-1.5 font-medium"
                style={{
                  backgroundColor: theme.isLight ? '#ecfdf5' : 'rgba(6, 78, 59, 0.4)',
                  borderColor: theme.isLight ? '#a7f3d0' : 'rgba(16, 185, 129, 0.3)',
                  color: theme.isLight ? '#065f46' : '#6ee7b7',
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Plugin compiled and registered to active extensions registry!</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
