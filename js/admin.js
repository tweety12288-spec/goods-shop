// 관리자 전용: 전체 사용자의 결제 내역 조회

const STATUS_LABEL = {
  paid: "결제완료",
  pending: "결제대기",
  failed: "결제실패",
};

function formatPrice(price) {
  return price.toLocaleString("ko-KR") + "원";
}

function formatDate(iso) {
  return new Date(iso).toLocaleString("ko-KR");
}

function renderOrders(orders, emailByUserId) {
  const list = document.getElementById("orderList");
  const emptyState = document.getElementById("emptyState");

  if (orders.length === 0) {
    emptyState.hidden = false;
    return;
  }

  list.innerHTML = orders
    .map(
      (o) => `
      <div class="order-card">
        <div class="order-row">
          <span class="label">구매자</span>
          <span>${emailByUserId[o.user_id] ?? o.user_id}</span>
        </div>
        <div class="order-row">
          <span class="label">상품</span>
          <span>${o.product_name}</span>
        </div>
        <div class="order-row">
          <span class="label">수량 / 금액</span>
          <span>${o.quantity}개 · ${formatPrice(o.price * o.quantity)}</span>
        </div>
        <div class="order-row">
          <span class="label">배송지</span>
          <span>${o.shipping_name} · ${o.shipping_phone} · ${o.shipping_address}</span>
        </div>
        <div class="order-row">
          <span class="label">주문일시</span>
          <span>${formatDate(o.created_at)}</span>
        </div>
        <div class="order-row">
          <span class="label">상태</span>
          <span class="status-badge ${o.status}">${STATUS_LABEL[o.status]}</span>
        </div>
      </div>
    `,
    )
    .join("");
}

async function init() {
  const user = await requireAdmin();
  if (!user) return;

  await renderNav("admin.html");

  const { data: orders, error } = await supabaseClient
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    const emptyState = document.getElementById("emptyState");
    emptyState.hidden = false;
    emptyState.textContent = "주문 내역을 불러오지 못했습니다: " + error.message;
    return;
  }

  const userIds = [...new Set((orders ?? []).map((o) => o.user_id))];
  const emailByUserId = {};

  if (userIds.length > 0) {
    const { data: profiles } = await supabaseClient
      .from("profiles")
      .select("id, email")
      .in("id", userIds);
    (profiles ?? []).forEach((p) => {
      emailByUserId[p.id] = p.email;
    });
  }

  renderOrders(orders ?? [], emailByUserId);
}

init();
