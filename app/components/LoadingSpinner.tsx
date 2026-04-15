interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export function LoadingSpinner({ size = 'md', text }: LoadingSpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-4',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`${sizeStyles[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-zinc-600 dark:text-zinc-400">{text}</p>
      )}
    </div>
  );
}

export function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-100 dark:bg-zinc-900">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}