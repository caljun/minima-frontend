const API_URL = "https://minima-backend1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("postName").value.trim();
    const price = parseInt(document.getElementById("postPrice").value.trim(), 10);
    const description = document.getElementById("postDescription").value.trim();
    const image = document.getElementById("postImage").files[0];

    if (isNaN(price) || price < 1 || price > 10000) {
      alert("価格は1円以上10000円以下で入力してください");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("reason", description);
    formData.append("image", image);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers:{
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        alert("出品が完了しました");
        window.location.href = "home.html";
      } else {
        const err = await res.json();
        alert("エラー：" + err.message);
      }
    } catch (err) {
      console.error("投稿エラー:", err);
      alert("サーバーエラーが発生しました");
    }
  });
});

// 投稿詳細ページで「購入」ボタンがある場合
const purchaseBtn = document.getElementById("purchaseBtn");

if (purchaseBtn) {
  purchaseBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("購入にはログインが必要です");
      window.location.href = "login.html";
      return;
    }

    const postId = new URLSearchParams(window.location.search).get("id");
    try {
      // 投稿情報を取得（名前と価格を取得するため）
      const postRes = await fetch(`${API_URL}/api/posts/${postId}`);
      const post = await postRes.json();

      const res = await fetch(`${API_URL}/api/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: post.name,
          price: post.price,
          postId
        })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "決済ページの作成に失敗しました");
      }
    } catch (err) {
      console.error("購入エラー:", err);
      alert("サーバーエラーが発生しました");
    }
  });
}
