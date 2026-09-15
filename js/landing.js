// 랜딩 페이지: 헤더 렌더링 + 상품 미리보기 + 상세 모달
// 상품 조회는 로그인 없이도 가능 (products 테이블은 공개 조회 RLS 정책 적용됨)

renderLandingHeader();

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

async function loadProducts() {
  const grid = document.getElementById("landingProductGrid");

  const { data: products, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error || !products) {
    grid.innerHTML = `<p class="empty-state">상품을 불러오지 못했습니다.</p>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
      <div class="product-card product-card-clickable" data-id="${p.id}">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-price">${formatPrice(p.price)}</div>
        </div>
      </div>
    `,
    )
    .join("");

  grid.querySelectorAll(".product-card-clickable").forEach((card) => {
    card.addEventListener("click", () => {
      const product = products.find((p) => p.id === card.dataset.id);
      openDetailModal(product);
    });
  });
}

function openDetailModal(product) {
  document.getElementById("detailImage").src = product.image_url;
  document.getElementById("detailImage").alt = product.name;
  document.getElementById("detailName").textContent = product.name;
  document.getElementById("detailPrice").textContent = formatPrice(
    product.price,
  );
  document.getElementById("detailDescription").textContent =
    product.description ?? "";
  document.getElementById("detailModal").hidden = false;
}

document.getElementById("closeDetail").addEventListener("click", () => {
  document.getElementById("detailModal").hidden = true;
});

loadProducts();
