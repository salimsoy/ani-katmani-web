import { useRef, useState } from "react";
import { Upload, Download, FileSpreadsheet, X, AlertCircle, CheckCircle2 } from "lucide-react";

const BASE_URL = "http://localhost:5059";

interface ImportError {
  rowNumber: number;
  message: string;
}

interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: ImportError[];
}

interface ImportExcelModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImportExcelModal({ onClose, onSuccess }: ImportExcelModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDownloadTemplate() {
    setDownloadingTemplate(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/figurines/import/template`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Şablon indirilemedi.");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "figurin-sablonu.xlsx";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Şablon indirilemedi. Tekrar deneyin.");
    } finally {
      setDownloadingTemplate(false);
    }
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".xlsx")) {
      setError("Sadece .xlsx dosyaları yüklenebilir.");
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setError(null);
    setResult(null);
  }

  async function handleUpload() {
    if (!selectedFile) return;

    setUploading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${BASE_URL}/figurines/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await response.json();

      // Backend hem 200 hem 400'de ImportResultDto döndürüyor
      if (data.success !== undefined) {
        setResult(data);
        if (data.success) onSuccess();
      } else {
        setError(data.message ?? "İçe aktarma başarısız.");
      }
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setUploading(false);
    }
  }

  function handleReset() {
    setSelectedFile(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Excel'den İçe Aktar</h2>
            <p className="text-sm text-gray-500 mt-1">
              Birden fazla figürini tek seferde ekleyin
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {/* 1. Şablon indirme */}
        <div className="rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <FileSpreadsheet size={20} className="text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">1. Şablonu indirin</p>
              <p className="text-xs text-gray-500 mb-2">
                Sütun sırasını korumak için hazır şablonu kullanın.
              </p>
              <button
                onClick={handleDownloadTemplate}
                disabled={downloadingTemplate}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                <Download size={13} />
                {downloadingTemplate ? "İndiriliyor..." : "Şablonu İndir"}
              </button>
            </div>
          </div>
        </div>

        {/* 2. Dosya seçme */}
        <div className="rounded-xl border border-gray-200 p-4 mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
              <Upload size={20} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">2. Doldurulmuş dosyayı yükleyin</p>
              <p className="text-xs text-gray-500 mb-2">
                Bir satırda bile hata varsa hiçbir ürün eklenmez.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleFileSelected}
                className="hidden"
              />

              {selectedFile ? (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                  <FileSpreadsheet size={14} className="text-gray-500 shrink-0" />
                  <span className="text-xs font-medium text-gray-700 truncate flex-1">
                    {selectedFile.name}
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-gray-700 shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  <Upload size={13} />
                  Dosya Seç
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Genel hata */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 mb-4">
            <div className="flex gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Başarı sonucu */}
        {result?.success && (
          <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 mb-4">
            <div className="flex gap-2">
              <CheckCircle2 size={16} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700 font-medium">
                {result.importedCount} ürün başarıyla eklendi.
              </p>
            </div>
          </div>
        )}

        {/* Hata listesi */}
        {result && !result.success && result.errors.length > 0 && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-4">
            <div className="flex gap-2 mb-3">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm font-bold text-red-800">
                {result.errors.length} hata bulundu — hiçbir ürün eklenmedi
              </p>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5">
              {result.errors.map((err, index) => (
                <div key={index} className="flex gap-2 text-xs">
                  {err.rowNumber > 0 && (
                    <span className="font-bold text-red-700 shrink-0">Satır {err.rowNumber}:</span>
                  )}
                  <span className="text-red-700">{err.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Aksiyon butonları */}
        <div className="flex gap-3">
          {result?.success ? (
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600"
            >
              Tamam
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-gray-600 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || uploading}
                className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? "Yükleniyor..." : "İçe Aktar"}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}