const API_URL = "https://iranai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    const postId = new URLSearchParams(window.location.search).get("postId");
    if (!postId) {
      alert("購入情報が見つかりません");
      return;
    }
  
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`);
      if (!res.ok) throw new Error("商品情報の取得に失敗しました");
      const post = await res.json();
  
      document.getElementById("itemImage").src = post.image || "default-image.png";
      document.getElementById("itemName").textContent = post.name;
      document.getElementById("itemPrice").textContent = `¥${post.price?.toLocaleString?.() || 0}`;
    } catch (err) {
      console.error("商品取得エラー:", err);
      alert("購入商品情報の取得に失敗しました");
    }
  });
  