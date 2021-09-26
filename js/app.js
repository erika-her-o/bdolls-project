import data from "./data.js";
import { dNone, deliveryBasePrice, deliveryPriceByProduct, body, modal, modalBody, modalTitle } from "./constants.js";
import { closeModal } from "./functions.js";

document.addEventListener('DOMContentLoaded', () => {
    const getProducts = () => JSON.parse(localStorage.getItem('products') || JSON.stringify(data));

    const setDisabledElement = (element, disabled) => disabled ? element.setAttribute("disabled", true) : element.removeAttribute("disabled");

    const setValueElement = (element, value) => (element.value = value);

    const updateLS = (newLS) => localStorage.setItem('products', JSON.stringify(newLS));

    const getTotalStock = () => getProducts().reduce((previous, current) => previous + current.stock, 0);

    const getProductsCart = () => getProducts().filter(({ quantity }) => !!quantity).map(({ title, quantity, total }) => ({
        title: title.split('-')[0].trim(),
        quantity,
        total,
        delivery: quantity * deliveryPriceByProduct,
        totalWithDelivery: quantity * deliveryPriceByProduct + total,
    }));

    const getTotalQuantityCart = () => getProductsCart().reduce((previous, current) => previous + current.quantity, 0);

    const getTotalPriceCart = () => getProductsCart().reduce((previous, current) => previous + current.total, 0);

    const getTotalDeliveryCart = () => getProductsCart().reduce((previous, current) => previous + current.delivery, 0) + deliveryBasePrice;

    const getTotalCart = () => getProductsCart().reduce((previous, current) => previous + current.totalWithDelivery, 0) + deliveryBasePrice;

    const createCartProductsInDOM = (cartDetails, { title, quantity, total }) => {
        const p = document.createElement('p');
        p.textContent = `° Producto: ${title} / Cantidad: ${quantity} / Total: $${total}`;
        cartDetails.appendChild(p);
    };

    const cancelCart = (element) => {
        element.remove();
        closeModal();
    };

    const modifyElements = (element, index, textContent) =>  index === 0 ? element.textContent = textContent : element.remove();

    const confirmCart = (loading, cartDetails) => {
        const texts = cartDetails.querySelectorAll('p');
        const buttons = cartDetails.querySelectorAll('button');
        const newProducts = getProducts().map(resetProductWithCurrentStock);
        updateLS(newProducts);
        modifyCart();
        loading.remove();
        cartDetails.removeAttribute('class');
        newProducts.forEach(updateProductInDOM);
        texts.forEach((text, index) => modifyElements(text, index, 'Compra exitosa'));
        buttons.forEach((button, index) => modifyElements(button, index, 'Cerrar'));
    };

    const waitConfirmCard = (cartDetails) => {
        const loading = document.createElement('img');
        loading.alt = 'loading';
        loading.className = 'loading';
        loading.src = 'https://erika-her-o.github.io/bdolls-project/assets/images/loading.gif';
        cartDetails.className = dNone;
        modalBody.appendChild(loading);
        setTimeout(() => confirmCart(loading, cartDetails), 3000);
    };

    const modifyCart = () => {
        const cart = document.getElementById('cart');
        const quantity = document.querySelector('.total-quantity');
        const total = document.querySelector('.total-price');
        const hasProductsInCart = !!getTotalQuantityCart();
        quantity.textContent = hasProductsInCart ? `+${getTotalQuantityCart()}` : '';
        total.textContent = hasProductsInCart ? `$${getTotalCart()}` : '';
        setDisabledElement(cart, !hasProductsInCart);
        cart.onclick = hasProductsInCart && createModalCart;
    };

    const updateProduct = (product, value) => {
        const { price, quantity } = product;
        const newQuantity = value > quantity ? quantity + 1 : quantity - 1;
        const newTotal = price * newQuantity;
        return { ...product, quantity: newQuantity, total: newTotal };
    };

    const checkIfUpdateProduct = (idToCompare, value, product) => {
        const { id, quantity } = product;
        const conditionToUpdate = id === idToCompare && quantity !== value;
        return conditionToUpdate ? updateProduct(product, value) : product;
    };

    const updateCart = ({ value, dataset: { id } }) => {
        const parsedValue = Number(value);
        const newProducts = getProducts().map((product) => checkIfUpdateProduct(id, parsedValue, product));
        updateLS(newProducts);
        modifyCart();
    };

    const modifyQuantity = (sum, remove, quantity, add) => {
        const parsedQuantityStock = Number(quantity.dataset.stock);
        const parsedQuantityValue = Number(quantity.value);
        const disabledRemove = sum === -1 && parsedQuantityValue === 1;
        const disabledAdd = sum === 1 && parsedQuantityValue === parsedQuantityStock - 1;
        const quantityValue = parsedQuantityValue + sum;
        setDisabledElement(remove, disabledRemove);
        setDisabledElement(add, disabledAdd);
        setValueElement(quantity, quantityValue);
        updateCart(quantity);
    };

    const insertProductToDOM = ({ id, image, title, price, stock, quantity }) => {
        const container = document.querySelector('.container');
        const product = document.createElement('div');
        const img = document.createElement('img');
        const firstP = document.createElement('p');
        const secondP = document.createElement('p');
        const thirdP = document.createElement('p');
        const firstButton = document.createElement('button');
        const input = document.createElement('input');
        const secondButton = document.createElement('button');
        product.id = id;
        product.className = 'product';
        img.alt = id;
        img.src = image;
        firstP.textContent = title;
        secondP.textContent = `$${price}`;
        thirdP.className = `stock${stock ? '' : ' sold-out'}`;
        thirdP.dataset.id = id;
        thirdP.textContent = `Stock: ${stock || 'Agotado'}`;
        firstButton.className = 'remove';
        firstButton.textContent = '-';
        firstButton.dataset.id = id;
        setDisabledElement(firstButton, !stock || quantity === 0);
        firstButton.onclick = () => modifyQuantity(-1, firstButton, input, secondButton);
        input.className = `quantity${stock ? '' : ' no-quantity'}`;
        input.type = 'text';
        input.dataset.id = id;
        input.dataset.stock = stock;
        setDisabledElement(input, true);
        setValueElement(input, quantity);
        secondButton.className = 'add';
        secondButton.textContent = '+';
        secondButton.dataset.id = id;
        setDisabledElement(secondButton, !stock || quantity === stock);
        secondButton.onclick = () => modifyQuantity(1, firstButton, input, secondButton);
        product.appendChild(img);
        product.appendChild(firstP);
        product.appendChild(secondP);
        product.appendChild(thirdP);
        product.appendChild(firstButton);
        product.appendChild(input);
        product.appendChild(secondButton);
        container.appendChild(product);
    };

    const updateProductInDOM = ({ id, stock }) => {
        const thirdP = document.querySelector(`.stock[data-id='${id}']`);
        const firstButton = document.querySelector(`.remove[data-id='${id}']`);
        const input = document.querySelector(`.quantity[data-id='${id}']`);
        const secondButton = document.querySelector(`.add[data-id='${id}']`);
        thirdP.className = `stock${stock ? '' : ' sold-out'}`;
        thirdP.textContent = `Stock: ${stock || 'Agotado'}`;
        input.className = `quantity${stock ? '' : ' no-quantity'}`;
        input.dataset.stock = stock;
        setDisabledElement(firstButton, true);
        setValueElement(input, '0');
        setDisabledElement(secondButton, !stock);
    };

    const updateLSAndModifyProductsInDOM = (newProducts, insert = false) => {
        updateLS(newProducts);
        modifyCart();
        newProducts.forEach(insert ? insertProductToDOM : updateProductInDOM);
    };

    const resetProductWithCurrentStock = (product) => {
        const { stock, quantity } = product;
        const newStock = stock - quantity;
        return { ...product, stock: newStock, quantity: 0, total: 0 };
    };

    const closeModalReset = (checkMark, cancelButton) => {
        checkMark.remove();
        cancelButton.remove();
        closeModal();
    };

    const resetToInitialData = () => {
        const checkMark = document.createElement('img');
        const cancelButton = document.createElement('button');
        modalTitle.textContent = 'Reinicio exitoso';
        checkMark.alt = 'check-mark';
        checkMark.className = 'check-mark';
        checkMark.src = 'https://erika-her-o.github.io/bdolls-project/assets/images/check-mark.png';
        cancelButton.className = 'cancel';
        cancelButton.textContent = 'Cerrar';
        cancelButton.onclick = () => closeModalReset(checkMark, cancelButton);
        modalBody.appendChild(checkMark);
        modalBody.appendChild(cancelButton);
        body.classList.add('no-overflow');
        modal.classList.remove(dNone);
        updateLSAndModifyProductsInDOM(data);
    };

    const runInFirstLoad = () => {
        const reset = document.getElementById('reset');
        reset.onclick = resetToInitialData;
        updateLSAndModifyProductsInDOM(getProducts(), true);
    };

    const createModalCart = () => {
        const cartDetails = document.createElement('div');
        const totalQuantityProducts = document.createElement('p');
        const totalPriceProducts = document.createElement('p');
        const delivery = document.createElement('p');
        const total = document.createElement('p');
        const cancelButton = document.createElement('button');
        const confirmButton = document.createElement('button');
        modalTitle.textContent = 'Mi carrito';
        cartDetails.id = 'cart-details';
        getProductsCart().forEach((product) => createCartProductsInDOM(cartDetails, product));
        totalQuantityProducts.textContent = `*Total cantidad productos: ${getTotalQuantityCart()}`;
        totalPriceProducts.textContent = `*Total precio productos: $${getTotalPriceCart()}`;
        delivery.textContent = `*Despacho: $${getTotalDeliveryCart()}`;
        total.textContent = `*Total: $${getTotalCart()}`;
        cancelButton.className = 'cancel';
        cancelButton.textContent = 'Cancelar';
        confirmButton.className = 'confirm';
        confirmButton.textContent = 'Confirmar';
        cancelButton.onclick = () => cancelCart(cartDetails);
        confirmButton.onclick = () => waitConfirmCard(cartDetails);
        cartDetails.appendChild(totalQuantityProducts);
        cartDetails.appendChild(totalPriceProducts);
        cartDetails.appendChild(delivery);
        cartDetails.appendChild(total);
        cartDetails.appendChild(cancelButton);
        cartDetails.appendChild(confirmButton);
        modalBody.appendChild(cartDetails);
        body.classList.add('no-overflow');
        modal.classList.remove(dNone);
    };

    (() => runInFirstLoad())();
});
