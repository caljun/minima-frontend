const API_URL = "https://minima-backend1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetchUserProfile();
  fetchUserPosts();
  setupImageUpload();
  setupLogout();
});

function fetchUserProfile() {
  fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(user => {
      document.getElementById("userName").textContent = user.name || "名無し";
      document.getElementById("userEmail").textContent = user.email || "";
      document.getElementById("profileIcon").src = user.imageUrl || "default-icon.png";

      const userUrl = `${window.location.origin}/u/${user.userUrl}`;
      const urlAnchor = document.getElementById("userUrl");
      urlAnchor.href = userUrl;
      urlAnchor.textContent = userUrl;
    })
    .catch(err => {
      console.error("ユーザー情報の取得失敗", err);
    });
}

function fetchUserPosts() {
  fetch(`${API_URL}/api/posts/mine`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(posts => {
      const gallery = document.getElementById("userPosts");
      gallery.innerHTML = "";

      posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";
      
        const img = document.createElement("img");
        img.src = post.imageUrl || "default-image.png";
        img.alt = "商品画像";
      
        const price = document.createElement("div");
        price.className = "price";
        price.textContent = `¥${post.price.toLocaleString()}`;
      
        const title = document.createElement("div");
        title.className = "title";
        title.textContent = post.name;
      
        // ✅ 編集ボタン
        const editBtn = document.createElement("a");
        editBtn.href = `post_edit.html?id=${post._id}`;
        editBtn.textContent = "編集";
        editBtn.className = "edit-btn"; // 必要に応じてCSS追加
      
        // ✅ 全体クリックで詳細へ遷移（ボタン除く）
        card.addEventListener("click", (e) => {
          if (!e.target.closest(".edit-btn")) {
            window.location.href = `post.html?id=${post._id}`;
          }
        });
      
        card.appendChild(img);
        card.appendChild(price);
        card.appendChild(title);
        card.appendChild(editBtn); // ← 編集ボタンを追加
        gallery.appendChild(card);
      });
    })
    .catch(err => {
      console.error("出品一覧の取得失敗", err);
    });
}

function setupImageUpload() {
  const imageInput = document.getElementById("profileImageUpload");
  imageInput.addEventListener("change", async () => {
    const file = imageInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("/api/users/profile-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData
      });

      const result = await res.json();
      if (res.ok) {
        document.getElementById("profileIcon").src = result.imageUrl;
      } else {
        alert(result.message || "アップロードに失敗しました");
      }
    } catch (err) {
      console.error("画像アップロード失敗", err);
    }
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "index.html";
    });
  }
}
