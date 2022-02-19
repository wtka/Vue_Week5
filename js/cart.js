/* eslint-disable no-undef */
const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'wtka';

// 載入規則
VeeValidate.defineRule('email', VeeValidateRules.email)
VeeValidate.defineRule('required', VeeValidateRules.required)

// 載入外部資源
VeeValidateI18n.loadLocaleFromURL('./zh_TW.json');

// 設定
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize('zh_TW'), // 語系設定
  validateOnInput: true, // 調整為輸入字元立即進行驗證
});

const app = Vue.createApp({
  data() {
    return {
      cartData: {},
      products: [],
      productId: '',
      isLoadingItem: '',
      user: {
        name: '',
        email: '',
        tel: '',
        address: '',
      },
      message: '',
    };
  },
  methods: {
    // 取得產品列表
    getProducts() {
      axios.get(`${apiUrl}/api/${apiPath}/products/all`)
        .then((res) => {
          this.products = res.data.products;
        });
    },
    // 開啟產品 Modal
    openProductModal(id) {
      this.productId = id;
      this.$refs.productModal.openModal();
    },
    // 取得購物車
    getCart() {
      axios.get(`${apiUrl}/api/${apiPath}/cart`)
        .then((res) => {
          this.cartData = res.data.data;
        });
    },
    // 加入產品至購物車
    addToCart(id, qty = 1) {
      const data = {
        product_id: id,
        qty,
      };
      this.isLoadingItem = id;
      axios.post(`${apiUrl}/api/${apiPath}/cart`, { data })
        .then(() => {
          this.getCart();
          this.$refs.productModal.closeModal();
          this.isLoadingItem = '';
        });
    },
    // 從購物車刪除指定產品
    removeCartItem(id) {
      this.isLoadingItem = id;
      axios.delete(`${apiUrl}/api/${apiPath}/cart/${id}`)
        .then(() => {
          this.getCart();
          this.isLoadingItem = '';
        });
    },
    // 清空購物車
    clearCart() {
      axios.delete(`${apiUrl}/api/${apiPath}/carts`)
        .then(() => {
          this.getCart();
          this.isLoadingItem = '';
        });
    },
    // 更新購物車
    updateCartItem(item) {
      const data = {
        product_id: item.id,
        qty: item.qty,
      };
      this.isLoadingItem = item.id;
      axios.put(`${apiUrl}/api/${apiPath}/cart/${item.id}`, { data })
        .then(() => {
          this.getCart();
          this.isLoadingItem = '';
        });
    },
    // 檢查電話號碼
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : '需要正確的電話號碼';
    },
    // 結帳
    order() {
      const data = {
        user: this.user,
        message: this.message,
      };
      if (this.cartData.carts.length) {
        axios.post(`${apiUrl}/api/${apiPath}/order`, { data })
          .then((res) => {
            if (res.data.success) {
              this.getCart();
              this.$refs.form.resetForm();
              this.message = '';
              alert(res.data.message);
            }
          })
          .catch((err) => {
            alert(err.data.message);
          });
      } else {
        alert('請加入商品至購物車');
      }
    },
  },
  // 初始化
  mounted() {
    this.getProducts();
    this.getCart();
  },
});

app.component('product-modal', {
  props: ['id'],
  template: '#userProductModal',
  data() {
    return {
      modal: {},
      product: {},
      qty: 1,
    };
  },
  // 監聽 id 取得產品資訊
  watch: {
    id() {
      this.getProduct();
    },
  },
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    getProduct() {
      axios.get(`${apiUrl}/api/${apiPath}/product/${this.id}`)
        .then((res) => {
          this.product = res.data.product;
        });
    },
    addToCart() {
      this.$emit('add-cart', this.product.id, this.qty);
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal);
  },
});

app.component('VForm', VeeValidate.Form);
app.component('VField', VeeValidate.Field);
app.component('ErrorMessage', VeeValidate.ErrorMessage);

app.mount('#app');
