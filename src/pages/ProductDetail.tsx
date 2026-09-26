import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/client";
import { PLACEHOLDER_IMAGE } from "../api/placeholderImage";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import type { Figurine, FavoriteItem } from "../types";
import { Loader2, Check, Star, ChevronDown, ChevronUp, PenLine, Wrench, Ruler, Clock } from "lucide-react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";
import LoadingState from "../components/LoadingState";

type Review = {
  id: number;
  reviewerFirstName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

const COLLAPSED_REVIEW_COUNT = 3;

export default function ProductDetail() {
  const LOW_STOCK_THRESHOLD = 10;
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { addToCart } = useCart();

  const [figurine, setFigurine] = useState<Figurine | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  function fetchReviews() {
    setReviewsLoading(true);
    apiFetch<Review[]>(`/figurines/${id}/reviews`)
      .then(setReviews)
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }

  useEffect(() => {
    setLoading(true);
    setActiveImageIndex(0);
    setQuantity(1); // yeni ürüne geçince adet sıfırlansın
    setErrorMessage(null);
    setShowAllReviews(false);
    setShowReviewForm(false);
    setNewRating(0);
    setNewComment("");
    setReviewError(null);
    setReviewSuccess(false);
    apiFetch<Figurine>(`/figurines/${id}`)
      .then(setFigurine)
      .catch(() => setFigurine(null))
      .finally(() => setLoading(false));

    fetchReviews();

    if (token) {
      apiFetch<FavoriteItem[]>("/favorites")
        .then((data) => setIsFavorite(data.some((f) => f.figurineId === Number(id))))
        .catch(() => {});
    } else {
      setIsFavorite(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  async function toggleFavorite() {
    if (!token) {
      navigate("/login");
      return;
    }
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await apiFetch(`/favorites/${id}`, { method: "DELETE" });
        setIsFavorite(false);
      } else {
        await apiFetch("/favorites", { method: "POST", body: JSON.stringify({ figurineId: Number(id) }) });
        setIsFavorite(true);
      }
    } catch (err) {
      console.error("Favori güncellenemedi:", err);
    } finally {
      setFavoriteLoading(false);
    }
  }

  function handlePrevImage() {
    setActiveImageIndex((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  }

  function handleNextImage() {
    setActiveImageIndex((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  }

  async function handleAddToCart() {
    if (!figurine) return;
    setAdding(true);
    setErrorMessage(null);
    try {
      await addToCart(figurine, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    } catch (err) {
      console.error("Sepete eklenemedi:", err);
      // Backend'den gelen "Yeterli stok yok..." mesajını göster
      const message = err instanceof Error ? err.message : "Sepete eklenirken bir hata oluştu.";
      setErrorMessage(message);
    } finally {
      setAdding(false);
    }
  }

  function openReviewForm() {
    if (!token) {
      navigate("/login");
      return;
    }
    setShowReviewForm(true);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    setReviewError(null);

    if (newRating < 1 || newRating > 5) {
      setReviewError("Lütfen 1 ile 5 arasında bir puan seçin.");
      return;
    }
    if (!newComment.trim()) {
      setReviewError("Yorum boş olamaz.");
      return;
    }

    setSubmittingReview(true);
    try {
      await apiFetch("/reviews", {
        method: "POST",
        body: JSON.stringify({ figurineId: Number(id), rating: newRating, comment: newComment }),
      });
      setNewRating(0);
      setNewComment("");
      setReviewSuccess(true);
      setShowReviewForm(false);
      fetchReviews();
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "Yorum eklenemedi.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (!figurine) {
    return <div className="flex justify-center py-20 text-gray-400">Figür bulunamadı!</div>;
  }

 const galleryImages = figurine
  ? [figurine.imageUrl || PLACEHOLDER_IMAGE, ...(figurine.images ?? []).map((img) => img.imageUrl)]
  : [];

  const stock = figurine.stock ?? 0;
  const outOfStock = stock === 0;
  const lowStock = stock > 0 && stock < LOW_STOCK_THRESHOLD;
  // Miktar butonları stok limitini aşmasın
  const canIncrease = quantity < stock;
  const canDecrease = quantity > 1;

  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, COLLAPSED_REVIEW_COUNT);
  const hasMoreReviews = reviews.length > COLLAPSED_REVIEW_COUNT;

  return (
    <div>
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={galleryImages[activeImageIndex] ?? PLACEHOLDER_IMAGE}
              alt={figurine.name}
              className={`w-full h-full object-cover ${outOfStock ? "opacity-60" : ""}`}
            />
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-white/90 flex items-center justify-center shadow disabled:opacity-50"
            >
              <Heart
                size={20}
                className={isFavorite ? "text-red-500" : "text-gray-400"}
                fill={isFavorite ? "currentColor" : "none"}
              />
            </button>

            {outOfStock && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="bg-red-500 text-white text-lg font-extrabold px-5 py-2 rounded-full shadow-lg">
                  Tükendi
                </span>
              </div>
            )}

            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto">
              {galleryImages.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                    index === activeImageIndex ? "border-orange-500" : "border-transparent"
                  }`}
                >
                  <img src={url} alt={`${figurine.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-bold px-3 py-1 rounded-lg mb-3">
            {figurine.filamentType}
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{figurine.name}</h1>
          {figurine.sellerStoreName && (
            <p className="text-sm text-gray-500 mb-2">
              Satıcı: <span className="font-semibold text-gray-700">{figurine.sellerStoreName}</span>
            </p>
          )}

          {reviews.length > 0 && (
            <button
              onClick={() =>
                document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" })
              }
              className="flex items-center gap-1.5 mb-3 hover:opacity-70 transition-opacity"
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={16}
                    className={star <= Math.round(averageRating) ? "text-yellow-400" : "text-gray-200"}
                    fill="currentColor"
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500 underline">
                {averageRating.toFixed(1)} ({reviews.length} değerlendirme)
              </span>
            </button>
          )}

          <p className="text-2xl font-extrabold text-gray-900 mb-3">{figurine.price} ₺</p>

          {/* Stok durumu */}
          <div className="mb-6">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-600">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Stokta Yok
              </span>
            ) : lowStock ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-3 py-1 text-sm font-semibold text-yellow-700">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                Son {stock} adet!
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Stokta
              </span>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-gray-900">Adet</span>
              <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={!canDecrease || outOfStock}
                  className="w-9 h-9 rounded-lg bg-white font-bold text-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  disabled={!canIncrease || outOfStock}
                  className="w-9 h-9 rounded-lg bg-white font-bold text-lg shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
              <p className="text-sm font-bold text-gray-900 mb-2">Ürün Detayları</p>
              <div className="flex justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <Wrench size={13} />
                  Malzeme
                </span>
                <span className="font-semibold text-gray-900">{figurine.filamentType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <Ruler size={13} />
                  Ölçek
                </span>
                <span className="font-semibold text-gray-900">{figurine.scale}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="inline-flex items-center gap-1.5 text-gray-500">
                  <Clock size={13} />
                  Üretim Süresi
                </span>
                <span className="font-semibold text-gray-900">{figurine.printTimeInHours} Saat</span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3">
              <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs text-gray-400">Toplam</p>
              <p className="text-xl font-extrabold text-gray-900">{(figurine.price * quantity).toFixed(2)} ₺</p>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={adding || outOfStock}
              className={`flex-1 rounded-xl py-3.5 font-bold text-white transition-colors duration-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                outOfStock
                  ? "bg-gray-400"
                  : justAdded
                  ? "bg-green-500"
                  : "bg-orange-500 hover:bg-orange-600 disabled:opacity-70"
              }`}
            >
              {outOfStock ? (
                "Stokta Yok"
              ) : adding ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Ekleniyor...
                </>
              ) : justAdded ? (
                <>
                  <Check size={18} />
                  Sepete Eklendi
                </>
              ) : (
                "Sepete Ekle"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Yorumlar */}
      <div id="reviews-section" className="border-t border-gray-100 mt-10 pt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">
            Değerlendirmeler {reviews.length > 0 && `(${reviews.length})`}
          </h2>

          {!showReviewForm && !reviewSuccess && (
            <button
              onClick={openReviewForm}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              <PenLine size={14} />
              Yorum Yap
            </button>
          )}
        </div>

        {reviewSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-6">
            <p className="text-sm font-semibold text-green-700">Yorumunuz eklendi, teşekkürler!</p>
          </div>
        )}

        {showReviewForm && (
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 mb-6">
            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Puanınız</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        size={26}
                        className={
                          star <= (hoverRating || newRating) ? "text-yellow-400" : "text-gray-200"
                        }
                        fill="currentColor"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Bu ürün hakkında ne düşünüyorsunuz?"
                rows={3}
                autoFocus
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none bg-white"
              />
              {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                >
                  {submittingReview ? "Gönderiliyor..." : "Gönder"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm(false);
                    setReviewError(null);
                  }}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                >
                  Vazgeç
                </button>
              </div>
            </form>
          </div>
        )}

        {reviewsLoading ? (
          <p className="text-sm text-gray-400">Yorumlar yükleniyor...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-gray-400">Bu ürün için henüz yorum yapılmamış.</p>
        ) : (
          <>
            <div className="space-y-4">
              {visibleReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">{review.reviewerFirstName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={13}
                          className={star <= review.rating ? "text-yellow-400" : "text-gray-200"}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>

            {hasMoreReviews && (
              <button
                onClick={() => setShowAllReviews((prev) => !prev)}
                className="flex items-center gap-1.5 mt-4 text-sm font-semibold text-orange-500 hover:text-orange-600"
              >
                {showAllReviews ? (
                  <>
                    <ChevronUp size={16} />
                    Daha Az Göster
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Tümünü Gör ({reviews.length})
                  </>
                )}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}