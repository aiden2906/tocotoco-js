const SETTING_ENDPOINT = 'https://api.tocotocotea.com/v1/settings';
const COLLECTION_ENPOINT= 'https://api.tocotocotea.com/v1/collections/<ID>/products';
let collections = [];
let collectionCount = 0;
const productHash = {};

$.get(SETTING_ENDPOINT, (resp) => {
    // console.log(setting)
    const setting = resp.mobile.south;
    console.log(setting);
    collections = setting.menu_screen.list_collections.filter(c => c.col_id);
    collectionCount = collections.length;
    renderCollections();

    let count = 0;
    collections.forEach(col => {
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
            count++;
            if (count === collectionCount) {
                renderCollections();
            }
        })
    })
})

function renderCollections() {
    console.log('render collection');
    const collectionsData = collections.map(c => ({
        count: productHash[c.col_id] ? productHash[c.col_id].length : 'N/A',
        id: c.col_id,
        title: c.collection_title
    }))
    const html = tmpl('tpl-cate-item', collectionsData);
    $('#menu').html(html);
}

function renderProductsByCollection() {
    const collectionId = $(this).data('id');
    const products = productHash[collectionId];
    const productsData = products.map(p => ({
        id: p.id,
        name: p.name, 
        imageUrl: p.images[0],
        price: (p.minPrice + '').formatMoney()
    }))
    const collection = collections.find(c => c.col_id == collectionId);

    const html = tmpl('tpl-product-item', {
        products: productsData,
        count: products.length + ' món',
        collectionTitle: collection.collection_title
    });
    $('#product-wrapper').html(html);
}

function addProductToCart() {
    const parent = $(this).closest('app-menu-item-product-grid');
    const id = $(parent).data('pid');
    console.log('Tề thiên đại thánh đã đến đây', id);
    //TODO làm tiếp cái giỏ hàng
}

String.prototype.formatMoney = function() {
    return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'đ';
}

$(document).on('click', '.menu-categories--item', renderProductsByCollection);
$(document).on('click', '.item-mn-product-action', addProductToCart);