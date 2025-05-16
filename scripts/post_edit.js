const API_URL = "https://minima-backend1.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("editForm");
    const token = localStorage.getItem("token");
    const postId = new URLSearchParams(window.location.search).get("id");
  
    if (!token || !postId) {
      alert("不正なアクセスです");
      window.location.href = "login.html";
      return;
    }
  
    // ① 投稿データを取得してフォームに反映
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`);
      const post = await res.json();
  
      document.getElementById("postName").value = post.name;
      document.getElementById("postPrice").value = post.price;
      document.getElementById("postDescription").value = post.reason;
      // 画像プレビューは省略（任意で追加可能）
  
    } catch (err) {
      console.error("投稿取得エラー:", err);
      alert("投稿データの取得に失敗しました");
      return;
    }
  
    // ② フォーム送信でPUTリクエスト
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("postName").value.trim();
      const price = parseInt(document.getElementById("postPrice").value.trim(), 10);
      const reason = document.getElementById("postDescription").value.trim();
      const image = document.getElementById("postImage").files[0];
  
      if (isNaN(price) || price < 1 || price > 10000) {
        alert("価格は1円以上10000円以下で入力してください");
        return;
      }
  
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("reason", reason);
      if (image) {
        formData.append("image", image); // 画像変更がある場合のみ
      }
  
      try {
        const res = await fetch(`${API_URL}/api/posts/${postId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData
        });
  
        const data = await res.json();
  
        if (res.ok) {
          alert("投稿を更新しました");
          window.location.href = "profile.html";
        } else {
          alert("更新失敗: " + data.message);
        }
  
      } catch (err) {
        console.error("更新エラー:", err);
        alert("サーバーエラーが発生しました");
      }
    });
  });
  