const API_URL = "https://iranai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async function () {
  const list = document.getElementById("notificationList");
  const token = localStorage.getItem("token");

  if (!token) {
    alert("ログインが必要です");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/api/notifications/me`, {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include"
    });

    if (!res.ok) {
      alert("通知の取得に失敗しました");
      return;
    }

    const notifications = await res.json();

    if (notifications.length === 0) {
      list.innerHTML = "<li>通知はまだありません。</li>";
      return;
    }

    notifications.forEach(n => {
      const li = document.createElement("li");
      li.classList.add("notification-item");
    
      // ✅ 未読なら .unread を付ける
      if (!n.read) {
        li.classList.add("unread");
      }
    
      const icon = {
        コメント: "💬",
        purchase: "📦",
        bought: "🛒"
      }[n.type] || "🔔";
    
      const dateStr = new Date(n.createdAt).toLocaleString();
    
      let message;
      switch (n.type) {
        case "コメント":
          message = `${n.fromEmail}さんがコメントしました`;
          break;
        case "purchase":
          message = `${n.fromEmail}さんがあなたの商品を購入しました`;
          break;
        case "bought":
          message = `あなたが ${n.fromEmail} さんの商品を購入しました`;
          break;
        default:
          message = `${n.fromEmail}さんから通知があります`;
      }
    
      li.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <span class="notification-text">${message}（${dateStr}）</span>
      `;
    
      // ✅ クリックで既読APIを叩いてから遷移
      if (n.postId) {
        li.addEventListener("click", async () => {
          if (!n.read) {
            try {
              await fetch(`${API_URL}/api/notifications/${n._id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` }
              });
            } catch (err) {
              console.error("既読化失敗:", err);
            }
          }
          window.location.href = `post.html?id=${n.postId}`;
        });
      }
    
      list.appendChild(li);
    });    
  } catch (err) {
    console.error("通知取得エラー:", err);
    alert("サーバーエラーが発生しました");
  }
});
