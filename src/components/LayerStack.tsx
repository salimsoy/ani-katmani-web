type Props = {
  className?: string;
};

const LAYERS = [
  { width: "56px", color: "#E8630C" },
  { width: "92px", color: "#F3EEE7" },
  { width: "132px", color: "#E67E36" },
  { width: "104px", color: "#5FA89B" },
  { width: "148px", color: "#F3EEE7" },
  { width: "76px", color: "#C24F09" },
];

export default function LayerStack({ className = "" }: Props) {
  return (
    <div className={`flex flex-col gap-2.5 ${className}`} aria-hidden="true">
      {LAYERS.map((layer, i) => (
        <span
          key={i}
          className="h-2.5 rounded-full animate-layer-rise"
          style={{ width: layer.width, backgroundColor: layer.color, animationDelay: `${i * 70}ms` }}
        />
      ))}
    </div>
  );
}
