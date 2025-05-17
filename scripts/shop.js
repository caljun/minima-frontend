const API_URL = "https://minima-backend1.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
  // URLからショップIDを取得
  const shopId = window.location.pathname.split("/").pop();
  if (!shopId) {
    alert("ショップが見つかりません");
    window.location.href = "/";
    return;
  }

  try {
    // ショップ情報を取得
    const shopRes = await fetch(`${API_URL}/api/users/shop/${shopId}`);
    if (!shopRes.ok) {
      throw new Error("ショップ情報の取得に失敗しました");
    }
    const shop = await shopRes.ok;

    // ショップ情報を表示
    document.getElementById("shopName").textContent = shop.shopName || "No Name";
    document.getElementById("shopNameDetail").textContent = shop.shopName || "No Name";
    document.getElementById("shopId").textContent = `@${shop.shopId}`;
    if (shop.profileImage) {
      document.getElementById("shopIcon").src = shop.profileImage;
    }

    // OGP情報を設定
    document.querySelector('meta[property="og:title"]').content = `${shop.shopName} | minima`;
    document.querySelector('meta[property="og:url"]').content = window.location.href;
    document.querySelector('meta[property="og:image"]').content = shop.profileImage || "/default-icon.png";

    // 商品一覧を取得
    const postsRes = await fetch(`${API_URL}/api/posts/user-email/${shop.email}`);
    if (!postsRes.ok) {
      throw new Error("商品一覧の取得に失敗しました");
    }
    const posts = await postsRes.json();

    // 商品一覧を表示
    const itemsGrid = document.getElementById("itemsGrid");
    posts.forEach(post => {
      const card = document.createElement("div");
      card.className = "item-card";
      card.onclick = () => {
        window.location.href = `post_detail.html?id=${post._id}`;
      };

      const img = document.createElement("img");
      img.src = post.imageUrl || "default-image.png";
      img.alt = post.name;

      const info = document.createElement("div");
      info.className = "item-info";

      const price = document.createElement("p");
      price.className = "item-price";
      price.textContent = `¥${post.price.toLocaleString()}`;

      const name = document.createElement("p");
      name.className = "item-name";
      name.textContent = post.name;

      if (post.sold) {
        const badge = document.createElement("div");
        badge.className = "sold-badge";
        badge.textContent = "SOLD";
        card.appendChild(badge);
      }

      info.appendChild(price);
      info.appendChild(name);
      card.appendChild(img);
      card.appendChild(info);
      itemsGrid.appendChild(card);
    });

  } catch (err) {
    console.error("ショップページ読み込みエラー:", err);
    alert("ページの読み込みに失敗しました");
  }
}); 