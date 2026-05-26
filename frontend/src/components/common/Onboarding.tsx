// Onboarding overlay component - Refined
import { useState, useEffect } from 'react';
import { Rocket, ArrowRight, X } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: '导入歌曲',
    description: '从左侧面板搜索歌曲、导入本地歌词，或粘贴任意歌词文本开始改编。',
    icon: '1',
  },
  {
    title: '智能编辑',
    description: '在中间区域编辑歌词，系统实时检测字数和押韵情况，用颜色提示您。',
    icon: '2',
  },
  {
    title: '押韵词库',
    description: '右侧面板提供常用押韵词参考，点击即可快速插入到当前行。',
    icon: '3',
  },
  {
    title: '导出分享',
    description: '支持导出为 TXT、LRC、HTML 格式，可生成精美的歌词海报图片。',
    icon: '4',
  },
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('lyriclab_onboarding_complete');
    if (!hasSeenOnboarding) {
      setTimeout(() => setVisible(true), 500);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem('lyriclab_onboarding_complete', 'true');
      setVisible(false);
      onComplete();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('lyriclab_onboarding_complete', 'true');
    setVisible(false);
    onComplete();
  };

  if (!visible) return null;

  const step = steps[currentStep];

  return (
    <div className="onboarding-overlay animate-fade-in">
      <div className="onboarding-card">
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step Number */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-5 shadow-lg">
          <span className="text-white text-xl font-bold">{step.icon}</span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          {step.title}
        </h2>

        {/* Description */}
        <p className="text-slate-600 mb-8 leading-relaxed">
          {step.description}
        </p>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === currentStep
                  ? 'w-6 bg-primary-500'
                  : i < currentStep
                  ? 'bg-primary-400'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            跳过
          </button>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary-500 text-white font-medium hover:bg-primary-600 transition-colors shadow-sm hover:shadow-md"
          >
            {currentStep < steps.length - 1 ? (
              <>
                下一步
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              '开始使用'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}