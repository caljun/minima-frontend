const API_URL = "https://minima-backend1.onrender.com";

// 商品データの取得と表示を管理するクラス
class PostGallery {
  constructor() {
    this.page = 1;
    this.loading = false;
    this.hasMore = true;
    this.filters = {
      price: 'all',
      sort: 'newest'
    };

    this.gallery = document.getElementById('postGallery');
    this.skeletonLoader = document.getElementById('skeletonLoader');
    this.loadingSpinner = document.getElementById('loadingSpinner');

    // フィルターの初期化
    this.initializeFilters();
    
    // 無限スクロールの設定
    this.initializeInfiniteScroll();

    // 初回読み込み
    this.loadPosts();
  }

  // フィルターの初期化
  initializeFilters() {
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');

    priceFilter.addEventListener('change', () => {
      this.filters.price = priceFilter.value;
      this.resetAndReload();
    });

    sortFilter.addEventListener('change', () => {
      this.filters.sort = sortFilter.value;
      this.resetAndReload();
    });
  }

  // 無限スクロールの初期化
  initializeInfiniteScroll() {
    const options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.loading && this.hasMore) {
          this.loadPosts();
        }
      });
    }, options);

    observer.observe(this.loadingSpinner);
  }

  // ギャラリーのリセットと再読み込み
  resetAndReload() {
    this.page = 1;
    this.hasMore = true;
    this.gallery.innerHTML = '';
    this.loadPosts();
  }

  // 商品データの読み込み
  async loadPosts() {
    if (this.loading || !this.hasMore) return;

    this.loading = true;
    this.showLoading();

    try {
      // APIからデータを取得
      const response = await fetch(`${API_URL}/api/posts?page=${this.page}&price=${this.filters.price}&sort=${this.filters.sort}`);
      const data = await response.json();

      if (data.posts.length === 0) {
        this.hasMore = false;
        this.hideLoading();
        return;
      }

      this.renderPosts(data.posts);
      this.page++;
    } catch (error) {
      console.error('投稿の読み込みに失敗しました:', error);
    } finally {
      this.loading = false;
      this.hideLoading();
    }
  }

  // 商品カードの生成
  createPostCard(post) {
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
    return card;
  }

  // 商品の一括表示
  renderPosts(posts) {
    const html = posts.map(post => this.createPostCard(post)).join('');
    this.gallery.insertAdjacentHTML('beforeend', html);
  }

  // ローディング表示の制御
  showLoading() {
    if (this.page === 1) {
      this.skeletonLoader.classList.remove('hidden');
      this.loadingSpinner.classList.add('hidden');
    } else {
      this.skeletonLoader.classList.add('hidden');
      this.loadingSpinner.classList.remove('hidden');
    }
  }

  hideLoading() {
    this.skeletonLoader.classList.add('hidden');
    this.loadingSpinner.classList.add('hidden');
  }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
  new PostGallery();
});
  