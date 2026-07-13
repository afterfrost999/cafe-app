(function () {
  const form = document.querySelector("#auth-form");
  const errorElement = document.querySelector("#auth-error");
  const mode = document.body.dataset.authMode;
  const { login, registerUser } = window.CAFE_UTILS;

  function redirectAfterAuth() {
    const next = new URLSearchParams(window.location.search).get("next");
    if (next && next.startsWith("/") && !next.startsWith("//")) {
      window.location.href = next;
      return;
    }
    window.location.href = "../index.html";
  }

  if (window.CAFE_PIXEL) {
    document.documentElement.style.setProperty(
      "--paper-tex",
      `url(${window.CAFE_PIXEL.paperTexture()})`
    );
    window.CAFE_PIXEL.applyFloor(
      document.querySelector(".auth-page"),
      null,
      true
    );
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    errorElement.textContent = "";
    const data = new FormData(form);
    const username = String(data.get("username") || "").trim();
    const password = String(data.get("password") || "");

    if (mode === "login") {
      const user = login(username, password);
      if (!user) {
        errorElement.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
        return;
      }
      redirectAfterAuth();
      return;
    }

    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const passwordConfirm = String(data.get("passwordConfirm") || "");
    if (!name || !email || !username || !password) {
      errorElement.textContent = "모든 항목을 입력해주세요.";
      return;
    }
    if (password !== passwordConfirm) {
      errorElement.textContent = "비밀번호가 서로 일치하지 않습니다.";
      return;
    }

    const result = registerUser({ username, password, name, email });
    if (!result.ok) {
      errorElement.textContent = result.message;
      return;
    }
    redirectAfterAuth();
  });
})();
