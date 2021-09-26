import { dNone, modalBody, modalTitle } from "./constants.js";
import { closeModal } from "./functions.js";

document.addEventListener('DOMContentLoaded', () => {
    const showMainPage = (check, userName) => {
        const welcome = document.getElementById('welcome');
        welcome.textContent = `Hola ${userName}`;
        check.remove();
        closeModal();
    };

    const checkCredentials = (check, user, pass, errorMessage) => {
        const userName = user.value.toUpperCase();
        const rightUser = user.value === 'user';
        const rightPass = pass.value === 'pass';
        const passed = rightUser && rightPass;
        return passed ? showMainPage(check, userName) : errorMessage.classList.remove(dNone);
    };

    const preventDefaultForm = (event, check, user, pass, errorMessage) => {
        event.preventDefault();
        checkCredentials(check, user, pass, errorMessage);
    };

    const checkIfEnterKeyPressed = (event, check, user, pass, errorMessage) => event.key === 'Enter' && checkCredentials(check, user, pass, errorMessage);

    const appendElementsInsideModal = () => {
        const check = document.createElement('form');
        const user = document.createElement('input');
        const pass = document.createElement('input');
        const buttonCheck = document.createElement('button');
        const errorMessage = document.createElement('p');
        modalTitle.textContent = 'Iniciar sesión:';
        check.id = 'check';
        user.id = 'user';
        user.placeholder = 'Nombre Usuario';
        user.type = 'text';
        user.onkeyup = (event) => checkIfEnterKeyPressed(event, check, user, pass, errorMessage);
        pass.id = 'pass';
        pass.placeholder = 'Contraseña';
        pass.type = 'password';
        pass.onkeyup = (event) => checkIfEnterKeyPressed(event, check, user, pass, errorMessage);
        buttonCheck.textContent = 'Iniciar';
        errorMessage.id = 'error-message';
        errorMessage.className = dNone;
        errorMessage.textContent = 'Credenciales incorrectas';
        check.onsubmit = (event) => preventDefaultForm(event, check, user, pass, errorMessage);
        check.appendChild(user);
        check.appendChild(pass);
        check.appendChild(buttonCheck);
        check.appendChild(errorMessage);
        modalBody.appendChild(check);
        user.focus();
    };

    (() => appendElementsInsideModal())();
});
