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
  
    // 手数料計算
    const priceInput = document.getElementById("postPrice");
    const commission = document.getElementById("commission");
    const profit = document.getElementById("profit");
  
    function calculateCommission() {
      const price = parseInt(priceInput.value) || 0;
      let commissionRate = price > 5000 ? 0.10 : 0.05;
      let commissionAmount = Math.floor(price * commissionRate);
      let profitAmount = price - commissionAmount;
  
      commission.textContent = commissionAmount.toLocaleString();
      profit.textContent = profitAmount.toLocaleString();
    }
  
    priceInput.addEventListener("input", calculateCommission);
  
    // 画像アップロード関連
    const dropZone = document.getElementById("dropZone");
    const imageInput = document.getElementById("postImage");
    const currentImage = document.getElementById("currentImage");
  
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });
  
    ['dragenter', 'dragover'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('drag-over');
      });
    });
  
    ['dragleave', 'drop'].forEach(eventName => {
      dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('drag-over');
      });
    });
  
    dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        imageInput.files = e.dataTransfer.files;
        previewImage(file);
      }
    });
  
    dropZone.addEventListener('click', () => {
      imageInput.click();
    });
  
    imageInput.addEventListener('change', (e) => {
      if (e.target.files[0]) {
        previewImage(e.target.files[0]);
      }
    });
  
    function previewImage(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        currentImage.style.backgroundImage = `url(${e.target.result})`;
        currentImage.classList.add('has-image');
      };
      reader.readAsDataURL(file);
    }
  
    // 文字数カウント
    const description = document.getElementById("postDescription");
    const charCount = document.querySelector(".char-count");
  
    description.addEventListener("input", () => {
      const length = description.value.length;
      charCount.textContent = `${length}/1000`;
      if (length > 1000) {
        charCount.classList.add("error");
      } else {
        charCount.classList.remove("error");
      }
    });
  
    // 投稿データを取得してフォームに反映
    try {
      const res = await fetch(`${API_URL}/api/posts/${postId}`);
      const post = await res.json();
  
      document.getElementById("postName").value = post.name;
      document.getElementById("postPrice").value = post.price;
      document.getElementById("postCategory").value = post.category;
      document.getElementById("postDescription").value = post.description;
      
      // 現在の画像を表示
      if (post.imageUrl) {
        currentImage.style.backgroundImage = `url(${post.imageUrl})`;
        currentImage.classList.add('has-image');
      }
  
      // 初期値での手数料計算
      calculateCommission();
      // 初期値での文字数カウント
      charCount.textContent = `${post.description.length}/1000`;
  
    } catch (err) {
      console.error("投稿取得エラー:", err);
      alert("投稿データの取得に失敗しました");
      return;
    }
  
    // フォーム送信
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("postName").value.trim();
      const price = parseInt(document.getElementById("postPrice").value.trim(), 10);
      const category = document.getElementById("postCategory").value;
      const description = document.getElementById("postDescription").value.trim();
      const image = document.getElementById("postImage").files[0];
  
      if (isNaN(price) || price < 1 || price > 10000) {
        alert("価格は1円以上10000円以下で入力してください");
        return;
      }
  
      if (description.length > 1000) {
        alert("商品の説明は1000文字以内で入力してください");
        return;
      }
  
      const formData = new FormData();
      formData.append("name", name);
      formData.append("price", price);
      formData.append("category", category);
      formData.append("description", description);
      if (image) {
        formData.append("image", image);
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
          alert("商品情報を更新しました");
          window.location.href = `post_detail.html?id=${postId}`;
        } else {
          alert(data.message || "更新に失敗しました");
        }
  
      } catch (err) {
        console.error("更新エラー:", err);
        alert("サーバーエラーが発生しました");
      }
    });
  });
  