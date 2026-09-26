import { Link } from "react-router-dom";

const YEAR = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="flex flex-col gap-[3px]" aria-hidden="true">
              <span className="block w-5 h-[2.5px] rounded-full bg-orange-500" />
              <span className="block w-5 h-[2.5px] rounded-full bg-ink" />
              <span className="block w-5 h-[2.5px] rounded-full bg-spool" />
            </span>
            <span className="font-display text-lg font-bold text-ink">Anı Katmanı 3D</span>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed">
            Her figür katman katman, sıfırdan sana özel basılır. Bir anıyı elle tutulur hale
            getirmenin en somut yolu.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Keşfet</p>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li>
              <Link to="/" className="hover:text-orange-600 transition-colors">
                Tüm Figürler
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-orange-600 transition-colors">
                Favorilerim
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-orange-600 transition-colors">
                Sepetim
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Hesabım</p>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li>
              <Link to="/orders" className="hover:text-orange-600 transition-colors">
                Siparişlerim
              </Link>
            </li>
            <li>
              <Link to="/returns" className="hover:text-orange-600 transition-colors">
                İadelerim
              </Link>
            </li>
            <li>
              <Link to="/complaints" className="hover:text-orange-600 transition-colors">
                Şikayetlerim
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Satıcılar</p>
          <ul className="space-y-2.5 text-sm text-gray-600">
            <li>
              <Link to="/seller-apply" className="hover:text-orange-600 transition-colors">
                Satıcı Ol
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">© {YEAR} Anı Katmanı 3D. Tüm hakları saklıdır.</p>
          <div className="flex h-1 w-24 rounded-full overflow-hidden" aria-hidden="true">
            <span className="flex-1 bg-orange-500" />
            <span className="flex-1 bg-ink" />
            <span className="flex-1 bg-spool" />
          </div>
        </div>
      </div>
    </footer>
  );
}
