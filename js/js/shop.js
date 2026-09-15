// 상품 목록 조회, 구매 모달, 토스페이먼츠 결제 요청

let currentUser = null;
let currentProduct = null;
const tossPayments = TossPayments(TOSS_CLIENT_KEY);

const grid = document.getElementById("productGrid");
const emptyState = document.getElementById("emptyState");
const modal = document.getElementById("buyModal");
const buyForm = document.getElementById("buyForm");

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

function renderProducts(products) {
  if (products.length === 0) {
    emptyState.hidden = false;
    return;
  }
  grid.innerHTML = products
    .map(
      (p) => `
      <div class="product-card">
        <img src="${p.image_url}" alt="${p.name}" loading="lazy" />
        <div class="product-body">
          <div class="product-name">${p.name}</div>
          <div class="product-desc">${p.description ?? ""}</div>
          <div class="product-price">${formatPrice(p.price)}</div>
          <button type="button" class="btn block buy-btn" data-id="${p.id}">구매하기</button>
        </div>
      </div>
    `,
    )
    .join("");

  grid.querySelectorAll(".buy-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const product = products.find((p) => p.id === btn.dataset.id);
      openBuyModal(product);
    });
  });
}

function openBuyModal(product) {
  currentProduct = product;
  document.getElementById("modalProductName").textContent = product.name;
  document.getElementById("modalProductPrice").textContent = formatPrice(
    product.price,
  );
  document.getElementById("quantity").value = 1;
  document.getElementById("shippingName").value = "";
  document.getElementById("shippingPhone").value = "";
  document.getElementById("shippingAddress").value = "";
  document.getElementById("buyError").textContent = "";
  modal.hidden = false;
}

function closeBuyModal() {
  modal.hidden = true;
  currentProduct = null;
}

document.getElementById("cancelBuy").addEventListener("click", closeBuyModal);

buyForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errorEl = document.getElementById("buyError");
  errorEl.textContent = "";

  const quantity = Number(document.getElementById("quantity").value);
  const shippingName = document.getElementById("shippingName").value.trim();
  const shippingPhone = document.getElementById("shippingPhone").value.trim();
  const shippingAddress = document
    .getElementById("shippingAddress")
    .value.trim();

  if (!currentProduct || quantity < 1) {
    errorEl.textContent = "잘못된 요청입니다.";
    return;
  }

  const amount = currentProduct.price * quantity;
  const tossOrderId = "order_" + crypto.randomUUID();

  const { error: insertError } = await supabaseClient.from("orders").insert({
    user_id: currentUser.id,
    product_id: currentProduct.id,
    product_name: currentProduct.name,
    price: currentProduct.price,
    quantity,
    shipping_name: shippingName,
    shipping_phone: shippingPhone,
    shipping_address: shippingAddress,
    status: "pending",
    toss_order_id: tossOrderId,
  });

  if (insertError) {
    errorEl.textContent = "주문 생성에 실패했습니다: " + insertError.message;
    return;
  }

  const successUrl = new URL("success.html", location.href).toString();
  const failUrl = new URL("fail.html", location.href).toString();

  try {
    await tossPayments.requestPayment("카드", {
      amount,
      orderId: tossOrderId,
      orderName: currentProduct.name,
      customerName: shippingName,
      successUrl,
      failUrl,
    });
  } catch (err) {
    errorEl.textContent = "결제창을 여는 중 오류가 발생했습니다.";
  }
});

async function init() {
  currentUser = await requireLogin();
  if (!currentUser) return;

  await renderNav("shop.html");

  const { data: products, error } = await supabaseClient
    .from("products")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    emptyState.hidden = false;
    emptyState.textContent = "상품을 불러오지 못했습니다: " + error.message;
    return;
  }

  renderProducts(products ?? []);
}

init();
