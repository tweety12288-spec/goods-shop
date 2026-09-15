// 로그인/회원가입 탭 전환 및 폼 처리

(async function redirectIfLoggedIn() {
  const user = await getCurrentUser();
  if (user) location.href = "shop.html";
})();

const tabs = document.querySelectorAll(".tab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    loginForm.hidden = !isLogin;
    signupForm.hidden = isLogin;
  });
});

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.textContent = "";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    errorEl.textContent = "로그인에 실패했습니다: " + error.message;
    return;
  }
  location.href = "shop.html";
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const errorEl = document.getElementById("signupError");
  errorEl.textContent = "";

  const { error } = await supabaseClient.auth.signUp({ email, password });

  if (error) {
    errorEl.textContent = "회원가입에 실패했습니다: " + error.message;
    return;
  }
  location.href = "shop.html";
});
