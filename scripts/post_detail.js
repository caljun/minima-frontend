const API_URL = "https://iranai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  const postId = new URLSearchParams(window.location.search).get("id");
  const token = localStorage.getItem("token");

  if (!postId) {
    alert("投稿IDが見つかりません");
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/posts/${postId}`);
    const post = await res.json();

    // 表示反映
    document.getElementById("postImage").src = post.image || "default-image.png";
    document.getElementById("postName").textContent = post.name;
    document.getElementById("postPrice").textContent = `¥${post.price?.toLocaleString?.() || 0}`;
    document.getElementById("postDescription").textContent = post.reason || "（説明なし）";

    // SOLD対策
    const purchaseBtn = document.getElementById("purchaseBtn");
    if (post.sold) {
      purchaseBtn.disabled = true;
      purchaseBtn.textContent = "売り切れ";
      purchaseBtn.style.backgroundColor = "#aaa";
    } else {
      purchaseBtn.addEventListener("click", async () => {
        if (!token) {
          alert("購入にはログインが必要です");
          window.location.href = "login.html";
          return;
        }

        try {
          const checkoutRes = await fetch(`${API_URL}/api/payment/checkout`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              name: post.name,
              price: post.price,
              postId: post._id
            })
          });

          const data = await checkoutRes.json();
          if (checkoutRes.ok && data.url) {
            window.location.href = data.url;
          } else {
            alert(data.message || "決済ページの生成に失敗しました");
          }
        } catch (err) {
          console.error("Stripe遷移エラー:", err);
          alert("サーバーエラーが発生しました");
        }
      });
    }

    // ✅ 投稿削除（JWTデコードしてemail比較）
    const userEmail = parseJwt(token)?.email;
    if (userEmail && userEmail === post.email) {
      const deleteBtn = document.getElementById("deleteBtn");
      deleteBtn.style.display = "block";
      deleteBtn.addEventListener("click", async () => {
        if (confirm("本当にこの投稿を削除しますか？")) {
          try {
            const delRes = await fetch(`${API_URL}/api/posts/${post._id}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`
              }
            });

            if (delRes.ok) {
              alert("投稿を削除しました");
              window.location.href = "profile.html";
            } else {
              alert("削除に失敗しました");
            }
          } catch (err) {
            console.error("削除エラー:", err);
            alert("サーバーエラーが発生しました");
          }
        }
      });
    }

  } catch (err) {
    console.error("投稿取得エラー:", err);
    alert("投稿情報の取得に失敗しました");
  }
});

// JWTをデコードする関数
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
}

  