import { Link } from "react-router-dom";
import { Home } from "lucide-react";
import LayerStack from "../components/LayerStack";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center text-center py-20">
      <LayerStack className="mb-8 items-center" />
      <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-orange-500 mb-3">
        404
      </p>
      <h1 className="font-display text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Bu katman hiç basılmamış.
      </h1>
      <p className="text-gray-500 mb-8 max-w-sm">
        Aradığın sayfa taşınmış ya da hiç var olmamış olabilir.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 transition-colors"
      >
        <Home size={18} />
        Anasayfaya Dön
      </Link>
    </div>
  );
}
