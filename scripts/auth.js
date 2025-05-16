const API_URL = "https://minima-backend1.onrender.com"; // ← 本番用バックエンドURL

document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("registerEmail").value.trim();
  const password = document.getElementById("registerPassword").value.trim();

  if (!email || !password) {
    alert("メールアドレスとパスワードを入力してください");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    let data = null;
    try {
      data = await res.json();
    } catch (jsonErr) {
      console.error("JSONパースエラー:", jsonErr);
      alert("サーバーからの応答が不正です");
      return;
    }

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "home.html";
    } else {
      alert(data.message || "登録に失敗しました");
    }

  } catch (err) {
    console.error("登録失敗:", err);
    alert("登録処理でエラーが発生しました");
  }
});

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("メールアドレスとパスワードを入力してください");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    let data = null;
    try {
      data = await res.json();
    } catch (jsonErr) {
      console.error("JSONパースエラー:", jsonErr);
      alert("サーバーからの応答が不正です");
      return;
    }

    if (res.ok) {
      localStorage.setItem("token", data.token);
      window.location.href = "home.html";
    } else {
      alert(data.message || "ログインに失敗しました");
    }

  } catch (err) {
    console.error("ログイン失敗:", err);
    alert("ログイン処理でエラーが発生しました");
  }
});
