import { dNone, body, modal, modalTitle } from "./constants.js";

export const closeModal = () => {
    modal.classList.add(dNone);
    body.removeAttribute('class');
    modalTitle.textContent = '';
};
