// Ürün görseli olmadığında (imageUrl === "") kullanılan yerel placeholder.
// Dış bir servise (örn. via.placeholder.com) bağımlı olmadığı için ağ erişimi olmayan
// ortamlarda da çalışır.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300">
      <rect width="300" height="300" fill="#eeeeee"/>
      <text x="150" y="155" font-family="sans-serif" font-size="20" fill="#999999" text-anchor="middle">Resim Yok</text>
    </svg>`
  );
