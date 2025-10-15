const filters = document.querySelector('.menu_filters');
const filters_overlay = document.querySelector('.filters_overlay');

const filtersMenuClick = () => {
    filters.classList.toggle('active');
    filters_overlay.classList.toggle('active');

    document.body.classList.toggle('no-scroll');
}

const closeFiltersMenuClick = () => {
    filters.classList.remove('active');
    filters_overlay.classList.remove('active');
    document.body.classList.remove('no-scroll');
}

filters_overlay.addEventListener('click', closeFiltersMenuClick);

window.addEventListener('resize', closeFiltersMenuClick);