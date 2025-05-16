const API_URL = "https://iranai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", async () => {
    const gallery = document.getElementById("postGallery");
  
    try {
      const res = await fetch(`${API_URL}/api/posts`);
      const posts = await res.json();
  
      posts.forEach(post => {
        const card = document.createElement("div");
        card.className = "post-card";
        card.onclick = () => {
          if (!post.sold) {
            window.location.href = `post.html?id=${post._id}`;
          }
        };
      
        const img = document.createElement("img");
        img.src = post.imageUrl || "default-image.png";
        img.alt = "商品画像";
      
        const price = document.createElement("div");
        price.className = "price";
        price.textContent = `¥${post.price.toLocaleString()}`;
      
        const title = document.createElement("div");
        title.className = "title";
        title.textContent = post.name;
      
        // ✅ SOLDバッジ追加
        if (post.sold) {
          const badge = document.createElement("div");
          badge.className = "sold-badge";
          badge.textContent = "SOLD";
          card.appendChild(badge);
        }
      
        card.appendChild(img);
        card.appendChild(price);
        card.appendChild(title);
        gallery.appendChild(card);
      });
    } catch (err) {
      console.error("投稿の取得に失敗しました", err);
    }
  });
  