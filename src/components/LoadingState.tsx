type Props = {
  label?: string;
  className?: string;
};

const BAR_HEIGHTS = [10, 16, 22, 16, 10];

export default function LoadingState({ label = "Yükleniyor...", className = "" }: Props) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 py-20 ${className}`}>
      <div className="flex items-end gap-1" aria-hidden="true">
        {BAR_HEIGHTS.map((h, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-orange-500 animate-layer-pulse"
            style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
