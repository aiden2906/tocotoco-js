const SETTING_ENDPOINT = 'https://api.tocotocotea.com/v1/settings';
const COLLECTION_ENPOINT = 'https://api.tocotocotea.com/v1/collections/<ID>/products';
let collections = [];
let collectionCount = 0;
const productHash = {};
let cart = [];
const products = [];

$.get(SETTING_ENDPOINT, (resp) => {
  const setting = resp.mobile.south;
  collections = setting.menu_screen.list_collections.filter((c) => c.col_id);
  collectionCount = collections.length;
  renderCollections();

  let count = 0;
  collections.forEach((col) => {
    if (!col.col_id) {
      count++;
      if (count === collectionCount) {
        renderCollections();
      }
      return;
    }

    const collectionId = col.col_id;
    const url = COLLECTION_ENPOINT.replace('<ID>', collectionId);
    $.get(url, (data) => {
      productHash[collectionId] = data.products;
      products.push(...data.products);
      count++;
      if (count === collectionCount) {
        renderCollections();
      }
    });
  });
});

renderCart();

function renderCollections() {
  const collectionsData = collections.map((c) => ({
    count: productHash[c.col_id] ? productHash[c.col_id].length : 'N/A',
    id: c.col_id,
    title: c.collection_title,
  }));
  const html = tmpl('tpl-cate-item', collectionsData);
  $('#menu').html(html);
}

function renderProductsByCollection() {
  const collectionId = $(this).data('id');
  const products = productHash[collectionId];
  const productsData = products.map((p) => ({
    id: p.id,
    name: p.name,
    imageUrl: p.images[0],
    price: (p.minPrice + '').formatMoney(),
  }));
  const collection = collections.find((c) => c.col_id == collectionId);

  const html = tmpl('tpl-product-item', {
    products: productsData,
    count: products.length + ' món',
    collectionTitle: collection.collection_title,
  });
  $('#product-wrapper').html(html);
}

function addProductToCart() {
  const parent = $(this).closest('app-menu-item-product-grid');
  const id = $(parent).data('pid');
  //TODO làm tiếp cái giỏ hàng
  const existItem = cart.find((c) => c.item.id === id);
  if (!existItem) {
    const product = products.find((item) => item.id === id);
    cart.push({
      item: product,
      quantity: 1,
    });
    console.log(product);
    renderCart();
    return;
  }
  existItem.quantity += 1;
  console.log(existItem);
  renderCart();
}

function addProductInCart() {
  const parent = $(this).closest('div');
  const id = $(parent).data('id');
  const existItem = cart.find((c) => c.item.id === id);
  existItem.quantity+=1;
  renderCart();
}

function removeProductInCart() {
  const parent = $(this).closest('div');
  const id = $(parent).data('id');
  const existItem = cart.find((c) => c.item.id === id);
  if (existItem) {
    if (existItem.quantity !== 1) {
      existItem.quantity -= 1;
      renderCart();
      return;
    }
    cart = cart.filter((c) => c.item.id !== id);
    renderCart();
    return;
  }
}

function renderCart() {
  const html = tmpl('tpl-cart-item', cart);
  $('#cart').html(html);
}

String.prototype.formatMoney = function () {
  return this.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
};

$(document).on('click', '.menu-categories--item', renderProductsByCollection);
$(document).on('click', '.item-mn-product-action', addProductToCart);
$(document).on('click', '.btn-action.add', addProductInCart);
$(document).on('click', '.btn-action.remove', removeProductInCart);
