// Auth modal component - Refined with better UX
import { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { useToast } from '../common/Toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useAuthStore();
  const { error: showError, success } = useToast();

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = '请输入邮箱';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!password) {
      newErrors.password = '请输入密码';
    } else if (password.length < 8) {
      newErrors.password = '密码至少8位';
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      newErrors.password = '密码需包含字母和数字';
    }

    if (mode === 'register' && password !== confirmPassword) {
      newErrors.confirm = '两次密码不一致';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        success('登录成功');
      } else {
        await register(email, password);
        success('注册成功');
      }
      onClose();
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      showError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
    setErrors({});
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={mode === 'login' ? '登录' : '注册'} size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="email"
          label="邮箱"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
        />

        <Input
          type="password"
          label="密码"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
        />

        {mode === 'register' && (
          <Input
            type="password"
            label="确认密码"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={errors.confirm}
          />
        )}

        <Button
          type="submit"
          disabled={isLoading}
          isLoading={isLoading}
          className="w-full"
        >
          {mode === 'login' ? '登录' : '注册'}
        </Button>

        <p className="text-center text-sm text-slate-600">
          {mode === 'login' ? '还没有账号？' : '已有账号？'}
          <button
            type="button"
            onClick={switchMode}
            className="text-primary-500 hover:text-primary-600 hover:underline ml-1 font-medium"
          >
            {mode === 'login' ? '立即注册' : '去登录'}
          </button>
        </p>
      </form>
    </Modal>
  );
}