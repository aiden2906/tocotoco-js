const SETTING_ENDPOINT = 'https://api.tocotocotea.com/v1/settings';
const COLLECTION_ENPOINT= 'https://api.tocotocotea.com/v1/collections/<ID>/products';
let collections = [];
const productHash = {};

$.get(SETTING_ENDPOINT, (resp) => {
    // console.log(setting)
    const setting = resp.mobile.south;
    console.log(setting);
    collections = setting.menu_screen.list_collections.filter(c => c.col_id);
    renderCollections();

    collections.forEach(col => {
        if (!col.col_id) return;
        
        const collectionId = col.col_id;
        const url = COLLECTION_ENPOINT.replace('<ID>', collectionId);
        $.get(url, (data) => {
            productHash[collectionId] = data.products;
        })
    })
})

function renderCollections() {
    var html = '';
    for (let c of collections) {
        html += 
        `<div onclick="renderProductsByCollection(${c.col_id})" class="menu-categories--item">
            <div class="item--label">${c.collection_title}</div>
            <div class="item--count">${productHash[c.col_id] ? productHash[c.col_id].length : 'N/A'}</div>
        </div>`
    }

    $('#menu').html(html);
}

function renderProductsByCollection(collectionId) {
    const products = productHash[collectionId];
    let html = '';

    html = products.map(p => {
        const imageUrl = p.images[0];
        const {name, minPrice, maxPrice} = p;
        return `
        <app-menu-item-product-grid class="item-left">
        <div class="item-menu-product-inner">
            <div class="product-feature-img"><img 
                    src="${imageUrl}">
            </div>
            <div class="item-mn-product-infor">
                <div class="product-title"><a 
                        class="router-link-cus">${name}</a><a
                </div>
                <div class="product-price">
                    <div class="price-current">${(minPrice + '').formatMoney()}</div> ..
                </div>
            </div>
            <div class="item-mn-product-action">
                <div class="item-mn-product-add">+</div>
            </div>
        </div>
        <!---->
    </app-menu-item-product-grid>
        
        `;
    }).join('\n');

    html = `<ul>${html}</ul>`;
    console.log(products);
    const collection = collections.find(c => c.col_id == collectionId);

    $('#products').html(html);
    $('.count-product').text(products.length + ' món');
    $('.group-title--label').text(collection.collection_title);
}

String.prototype.formatMoney = function() {
    return this.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + 'đ';
}


