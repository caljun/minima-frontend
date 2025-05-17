const API_URL = "https://minima-backend1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  fetchUserProfile();
  fetchUserPosts();
  setupImageUpload();
  setupNameUpdate();
  setupShopNameUpdate();
  setupUrlCopy();
  setupLogout();
});

function fetchUserProfile() {
  fetch(`${API_URL}/api/users/me`, {
    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  })
    .then(res => res.json())
    .then(user => {
      // プロフィール画像
      if (user.profileImage) {
        document.getElementById("profileIcon").src = user.profileImage;
      }

      // ユーザー名
      const nameInput = document.getElementById("userName");
      nameInput.value = user.name || "";

      // ショップ名
      const shopNameInput = document.getElementById("shopName");
      shopNameInput.value = user.shopName || "";

      // ショップURL
      const shopUrl = `${window.location.origin}/shop/${user.shopId}`;
      const urlAnchor = document.getElementById("shopUrl");
      urlAnchor.href = shopUrl;
      urlAnchor.textContent = shopUrl;
    })
    .catch(err => {
      console.error("ユーザー情報の取得失敗", err);
      alert("プロフィール情報の取得に失敗しました");
    });
}

function fetchUserPosts() {
  fetch(`${API_URL}/api/posts/me`, {
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

function setupNameUpdate() {
  const updateBtn = document.getElementById("updateName");
  const nameInput = document.getElementById("userName");

  updateBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) {
      alert("名前を入力してください");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        alert("名前を更新しました");
      } else {
        alert("更新に失敗しました");
      }
    } catch (err) {
      console.error("名前更新エラー:", err);
      alert("更新中にエラーが発生しました");
    }
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
      const res = await fetch(`${API_URL}/api/users/profile-image`, {
        method: "PUT",
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
      alert("アップロード中にエラーが発生しました");
    }
  });
}

function setupShopNameUpdate() {
  const updateBtn = document.getElementById("updateShopName");
  const shopNameInput = document.getElementById("shopName");

  updateBtn.addEventListener("click", async () => {
    const shopName = shopNameInput.value.trim();
    if (!shopName) {
      alert("ショップ名を入力してください");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/users/shop-name`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ shopName })
      });

      if (res.ok) {
        alert("ショップ名を更新しました");
      } else {
        alert("更新に失敗しました");
      }
    } catch (err) {
      console.error("ショップ名更新エラー:", err);
      alert("更新中にエラーが発生しました");
    }
  });
}

function setupUrlCopy() {
  const copyBtn = document.getElementById("copyUrl");
  copyBtn.addEventListener("click", () => {
    const url = document.getElementById("shopUrl").href;
    navigator.clipboard.writeText(url)
      .then(() => alert("URLをコピーしました"))
      .catch(() => alert("コピーに失敗しました"));
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
