const API_URL = "https://iranai-backend.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("searchInput");
    const button = document.getElementById("searchBtn");
    const results = document.getElementById("searchResults");
  
    button.addEventListener("click", async () => {
      const keyword = input.value.trim();
  
      if (!keyword) return;
  
      try {
        const res = await fetch(`${API_URL}/api/posts?search=${encodeURIComponent(keyword)}`);
        const posts = await res.json();
        results.innerHTML = "";
  
        if (posts.length === 0) {
          results.innerHTML = "<p>該当する投稿が見つかりませんでした。</p>";
          return;
        }
  
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

          if (post.sold) {
            const badge = document.createElement("div");
            badge.className = "sold-badge";
            badge.textContent = "SOLD";
            card.appendChild(badge);
          }
  
          card.appendChild(img);
          card.appendChild(price);
          card.appendChild(title);
          results.appendChild(card);
        });
  
      } catch (err) {
        console.error("検索に失敗しました", err);
        results.innerHTML = "<p>エラーが発生しました。</p>";
      }
    });
  });
  