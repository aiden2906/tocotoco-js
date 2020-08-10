const SETTING_ENDPOINT = 'https://api.tocotocotea.com/v1/settings';
const COLLECTION_ENPOINT = 'https://api.tocotocotea.com/v1/collections/<ID>/products';
let collections = [];
let collectionCount = 0;
const productHash = {};
let cart = [];
const products = [];
const token = '818392022:AAEuHp2dFA5MYcC7r_NQHobsFzG8Z4DM2ow';
const groupId = '-430179139';
let isFirstRender = false;

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
      if (!isFirstRender) {
        isFirstRender = true;
        renderProductsByCollection(col.col_id);
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

function renderProductsByCollection(id) {
  let collectionId;
  if (typeof id === 'string') {
    collectionId = id;
  } else {
    collectionId = $(this).data('id');
  }
  console.log(collectionId);
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
  existItem.quantity += 1;
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

function remvoveAll() {
  console.log('remove all');
  cart = [];
  renderCart();
}

function renderCart() {
  const html = tmpl('tpl-cart-item', cart);
  $('#cart').html(html);
}

function renderPay() {
  const html = tmpl('tpl-payment', cart);
  $('#payment-outer').html(html);
  $('.hover_bkgr_fricc').show();
  const cb = (err, res) => {
    if (err) {
      alert('Khong the gui tin nhan');
    } else {
      alert('Dat hang thanh toan');
    }
  };
  let message = 'Trần Thanh Quang\n---------\n';
  message += cart
    .map((c) => {
      return `${c.item.name} x ${c.quantity} = ${(c.item.minPrice * c.quantity + '').formatMoney()}\n`;
    })
    .join('');
  message += `--------\nTổng tiền : ${(cart.reduce((cur, i) => cur + i.quantity * i.item.minPrice, 0) + '').formatMoney()}`;
  sendMessage(groupId, message, token, cb);
}

function sendMessage(id, message, token, cb) {
  var url = `https://api.telegram.org/bot${token}/sendMessage`;
  var data = {
    chat_id: id,
    text: message,
  };

  $.post(url, data)
    .then((resp) => {
      console.log('send message success:', resp);
      cb(null, resp);
    })
    .fail((error) => {
      console.error('send message error:', error);
      cb(error, null);
    });
}

String.prototype.formatMoney = function () {
  return this.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ';
};

$(document).on('click', '.menu-categories--item', renderProductsByCollection);
$(document).on('click', '.item-mn-product-action', addProductToCart);
$(document).on('click', '.btn-action.add', addProductInCart);
$(document).on('click', '.btn-action.remove', removeProductInCart);
$(document).on('click', '#remove-all', remvoveAll);
$(document).on('click', '.trigger_popup_fricc', renderPay);
$(document).on('click', '.hover_bkgr_fricc', function () {
  $('.hover_bkgr_fricc').hide();
});

$(document).on('click', '.popupCloseButton', function () {
  $('.hover_bkgr_fricc').hide();
});
