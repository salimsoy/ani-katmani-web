import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../../api/client";
import { MessageSquare, Star, Trash2 } from "lucide-react";

type AdminReview = {
  id: number;
  figurineId: number;
  figurineName: string;
  reviewerFirstName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchReviews() {
    apiFetch<AdminReview[]>("/reviews/admin")
      .then(setReviews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchReviews();
  }, []);

  async function handleDelete(id: number) {
    if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    try {
      await apiFetch(`/reviews/${id}`, { method: "DELETE" });
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch {
      window.alert("Yorum silinemedi.");
    }
  }

  if (loading) {
    return <div className="flex justify-center py-20 text-gray-400">Yükleniyor...</div>;
  }

  return (
    <div>
      <p className="text-sm text-gray-500 mb-6">{reviews.length} yorum</p>

      {reviews.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-gray-400">
          <MessageSquare size={48} className="mb-4" />
          <p className="font-semibold">Henüz yorum yok.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Ürün</th>
                  <th className="px-4 py-3">Kullanıcı</th>
                  <th className="px-4 py-3">Puan</th>
                  <th className="px-4 py-3">Yorum</th>
                  <th className="px-4 py-3">Tarih</th>
                  <th className="px-4 py-3 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {reviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        to={`/product/${review.figurineId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-gray-900 hover:text-orange-500"
                      >
                        {review.figurineName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{review.reviewerFirstName}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-600">
                        <Star size={12} className="text-yellow-400" fill="currentColor" />
                        {review.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{review.comment}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(review.id)}
                        className="rounded-lg bg-red-50 text-red-500 text-xs font-semibold px-3 py-1.5 flex items-center gap-1 hover:bg-red-100 ml-auto"
                      >
                        <Trash2 size={12} />
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}