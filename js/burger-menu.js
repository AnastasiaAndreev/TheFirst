const nav = document.querySelector('.burger_menu');
const overlay = document.querySelector('.overlay');

const burgerMenuClick = () => {
    nav.classList.toggle('active');
    overlay.classList.toggle('active');

    document.body.classList.toggle('no-scroll');
}

const closeBurgerMenuClick = () => {
    nav.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

overlay.addEventListener('click', closeBurgerMenuClick);

window.addEventListener('resize', closeBurgerMenuClick);