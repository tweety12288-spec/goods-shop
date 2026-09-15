// 서비스워커 등록 + "홈 화면에 추가" 안내 배너
// Android/Chrome: beforeinstallprompt로 네이티브 설치 유도
// iOS Safari: 해당 API가 없어 수동 안내 문구로 대체

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}

(function () {
  const DISMISSED_KEY = "pwaInstallDismissed";

  const isStandalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    window.navigator.standalone === true;

  if (isStandalone || localStorage.getItem(DISMISSED_KEY)) return;

  const isIos = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  if (!isIos && !isAndroid) return;

  let deferredPrompt = null;

  function dismiss(banner) {
    localStorage.setItem(DISMISSED_KEY, "1");
    banner.remove();
  }

  function showBanner(onInstallClick) {
    const banner = document.createElement("div");
    banner.className = "install-banner";
    banner.innerHTML = `
      <span class="install-banner-text">${
        isIos
          ? "홈 화면에 추가하려면 공유 버튼을 누른 뒤 “홈 화면에 추가”를 선택하세요"
          : "turingshop을 홈 화면에 추가하고 앱처럼 사용해보세요"
      }</span>
      <div class="install-banner-actions">
        ${isIos ? "" : '<button type="button" id="pwaInstallBtn" class="btn">설치</button>'}
        <button type="button" id="pwaDismissBtn" class="btn secondary">닫기</button>
      </div>
    `;
    document.body.appendChild(banner);

    document
      .getElementById("pwaDismissBtn")
      .addEventListener("click", () => dismiss(banner));

    if (!isIos) {
      document
        .getElementById("pwaInstallBtn")
        .addEventListener("click", async () => {
          dismiss(banner);
          if (onInstallClick) await onInstallClick();
        });
    }
  }

  if (isIos) {
    setTimeout(showBanner, 1500);
  } else {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      showBanner(async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        await deferredPrompt.userChoice;
        deferredPrompt = null;
      });
    });
  }
})();
