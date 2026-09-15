// 로그인 체크, 관리자 체크, 로그아웃, 공통 네비게이션 렌더링
// (주의) 이 파일의 체크는 UX용일 뿐, 실제 데이터 보호는 Supabase RLS 정책이 담당한다.

async function getCurrentUser() {
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  return user;
}

async function requireLogin() {
  const user = await getCurrentUser();
  if (!user) {
    location.href = "index.html";
    return null;
  }
  return user;
}

async function isAdmin(user) {
  if (!user) return false;
  const { data } = await supabaseClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

async function requireAdmin() {
  const user = await requireLogin();
  if (!user) return null;
  const admin = await isAdmin(user);
  if (!admin) {
    location.href = "shop.html";
    return null;
  }
  return user;
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.href = "index.html";
}

async function renderNav(activePage) {
  const nav = document.getElementById("nav");
  if (!nav) return;

  const user = await getCurrentUser();
  if (!user) {
    nav.innerHTML = "";
    return;
  }

  const admin = await isAdmin(user);

  const links = [
    { href: "shop.html", label: "상품", show: true },
    { href: "orders.html", label: "내 주문", show: true },
    { href: "admin.html", label: "관리자", show: admin },
  ];

  nav.innerHTML = `
    <div class="nav-links">
      ${links
        .filter((l) => l.show)
        .map(
          (l) =>
            `<a href="${l.href}" class="nav-link${
              activePage === l.href ? " active" : ""
            }">${l.label}</a>`,
        )
        .join("")}
    </div>
    <button id="logoutBtn" class="nav-logout" type="button">로그아웃</button>
  `;

  document.getElementById("logoutBtn").addEventListener("click", logout);
}
