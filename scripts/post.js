const API_URL = "https://minima-backend1.onrender.com";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("postForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("postName").value.trim();
    const price = parseInt(document.getElementById("postPrice").value.trim(), 10);
    const description = document.getElementById("postDescription").value.trim();
    const image = document.getElementById("postImage").files[0];

    if (isNaN(price) || price < 1 || price > 10000) {
      alert("価格は1円以上10000円以下で入力してください");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("reason", description);
    formData.append("image", image);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/api/posts`, {
        method: "POST",
        headers:{
          Authorization: `Bearer ${token}`
        },
        body: formData,
      });

      if (res.ok) {
        alert("出品が完了しました");
        window.location.href = "home.html";
      } else {
        const err = await res.json();
        alert("エラー：" + err.message);
      }
    } catch (err) {
      console.error("投稿エラー:", err);
      alert("サーバーエラーが発生しました");
    }
  });
});

// 投稿詳細ページで「購入」ボタンがある場合
const purchaseBtn = document.getElementById("purchaseBtn");

if (purchaseBtn) {
  purchaseBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("購入にはログインが必要です");
      window.location.href = "login.html";
      return;
    }

    const postId = new URLSearchParams(window.location.search).get("id");
    try {
      // 投稿情報を取得（名前と価格を取得するため）
      const postRes = await fetch(`${API_URL}/api/posts/${postId}`);
      const post = await postRes.json();

      const res = await fetch(`${API_URL}/api/payment/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: post.name,
          price: post.price,
          postId
        })
      });

      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "決済ページの作成に失敗しました");
      }
    } catch (err) {
      console.error("購入エラー:", err);
      alert("サーバーエラーが発生しました");
    }
  });
}

class PostForm {
  constructor() {
    this.currentStep = 1;
    this.formData = new FormData();
    this.autoSaveKey = 'post_draft';

    this.initializeElements();
    this.initializeEventListeners();
    this.loadDraft();
  }

  // 要素の初期化
  initializeElements() {
    this.form = document.getElementById('postForm');
    this.steps = document.querySelectorAll('.form-step');
    this.progressSteps = document.querySelectorAll('.progress-step');
    this.dropZone = document.getElementById('dropZone');
    this.imageInput = document.getElementById('postImage');
    this.imagePreview = document.getElementById('imagePreview');
    this.priceInput = document.getElementById('postPrice');
    this.commission = document.getElementById('commission');
    this.profit = document.getElementById('profit');
    this.description = document.getElementById('postDescription');
    this.charCount = document.querySelector('.char-count');
  }

  // イベントリスナーの設定
  initializeEventListeners() {
    // ドラッグ&ドロップ
    this.initializeDragAndDrop();

    // 画像選択
    this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));

    // 価格入力
    this.priceInput.addEventListener('input', () => this.calculateCommission());

    // 文字数カウント
    this.description.addEventListener('input', () => this.updateCharCount());

    // フォーム送信
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    // ステップ間の移動
    document.querySelectorAll('.next-step').forEach(button => {
      button.addEventListener('click', () => this.nextStep());
    });

    document.querySelectorAll('.back-step').forEach(button => {
      button.addEventListener('click', () => this.previousStep());
    });

    // 自動保存
    this.initializeAutoSave();
  }

  // ドラッグ&ドロップの初期化
  initializeDragAndDrop() {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => {
        this.dropZone.classList.add('drag-over');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      this.dropZone.addEventListener(eventName, () => {
        this.dropZone.classList.remove('drag-over');
      });
    });

    this.dropZone.addEventListener('drop', (e) => {
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.imageInput.files = e.dataTransfer.files;
        this.handleImageSelect({ target: this.imageInput });
      }
    });
  }

  // 画像選択の処理
  handleImageSelect(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview.innerHTML = `<img src="${e.target.result}" alt="プレビュー">`;
        this.imagePreview.classList.remove('hidden');
      };
      reader.readAsDataURL(file);
      this.formData.set('image', file);
      this.saveDraft();
    }
  }

  // 手数料計算
  calculateCommission() {
    const price = parseInt(this.priceInput.value) || 0;
    let commissionRate = 0.05; // 5%
    if (price > 5000) {
      commissionRate = 0.10; // 10%
    }

    const commissionAmount = Math.floor(price * commissionRate);
    const profitAmount = price - commissionAmount;

    this.commission.textContent = commissionAmount.toLocaleString();
    this.profit.textContent = profitAmount.toLocaleString();
  }

  // 文字数カウント
  updateCharCount() {
    const count = this.description.value.length;
    this.charCount.textContent = `${count}/1000`;
  }

  // ステップ移動
  nextStep() {
    if (this.validateCurrentStep()) {
      this.steps[this.currentStep - 1].classList.add('hidden');
      this.steps[this.currentStep].classList.remove('hidden');
      this.progressSteps[this.currentStep - 1].classList.remove('active');
      this.progressSteps[this.currentStep].classList.add('active');
      this.currentStep++;

      if (this.currentStep === 3) {
        this.showFinalPreview();
      }
    }
  }

  previousStep() {
    this.steps[this.currentStep - 1].classList.add('hidden');
    this.steps[this.currentStep - 2].classList.remove('hidden');
    this.progressSteps[this.currentStep - 1].classList.remove('active');
    this.progressSteps[this.currentStep - 2].classList.add('active');
    this.currentStep--;
  }

  // 現在のステップのバリデーション
  validateCurrentStep() {
    if (this.currentStep === 1) {
      return this.imageInput.files.length > 0;
    }
    return true;
  }

  // 確認画面のプレビュー表示
  showFinalPreview() {
    const preview = document.getElementById('finalPreview');
    const formData = new FormData(this.form);
    
    preview.innerHTML = `
      <div class="preview-image">
        ${this.imagePreview.innerHTML}
      </div>
      <div class="preview-info">
        <p><strong>商品名:</strong> ${formData.get('postName')}</p>
        <p><strong>価格:</strong> ¥${parseInt(formData.get('postPrice')).toLocaleString()}</p>
        <p><strong>カテゴリー:</strong> ${document.getElementById('postCategory').selectedOptions[0].text}</p>
        <p><strong>商品の説明:</strong><br>${formData.get('postDescription')}</p>
      </div>
    `;
  }

  // 自動保存の初期化
  initializeAutoSave() {
    const inputs = this.form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('change', () => this.saveDraft());
      input.addEventListener('input', () => this.saveDraft());
    });
  }

  // 下書きの保存
  saveDraft() {
    const formData = new FormData(this.form);
    const draft = {};
    formData.forEach((value, key) => {
      draft[key] = value;
    });
    localStorage.setItem(this.autoSaveKey, JSON.stringify(draft));
  }

  // 下書きの読み込み
  loadDraft() {
    const draft = localStorage.getItem(this.autoSaveKey);
    if (draft) {
      const data = JSON.parse(draft);
      Object.entries(data).forEach(([key, value]) => {
        const input = this.form.querySelector(`[name="${key}"]`);
        if (input) {
          input.value = value;
        }
      });
    }
  }

  // フォーム送信
  async handleSubmit(e) {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: this.formData
      });

      if (response.ok) {
        localStorage.removeItem(this.autoSaveKey);
        window.location.href = '/success.html';
      } else {
        throw new Error('投稿に失敗しました');
      }
    } catch (error) {
      console.error('エラー:', error);
      alert('投稿に失敗しました。もう一度お試しください。');
    }
  }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
  new PostForm();
});
