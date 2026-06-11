interface LoadingBannerProps {
  message?: string;
  progress?: number;
}

export function LoadingBanner({ message = 'Carregando tickets...', progress }: LoadingBannerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-blue-100 rounded-full" />
        <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
      <p className="text-gray-600 font-medium">{message}</p>
      {progress !== undefined && (
        <div className="w-64">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
