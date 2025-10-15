const modalOverlay = document.querySelector('.modal-overlay');
const modal = document.querySelector('.modal');
const openModalBtn = document.querySelector('.open-modal-btn');
const closeModalBtn = document.querySelector('.modal-close');

function openModal() {
    modalOverlay.classList.add('active');
    modal.classList.add('active');
}

function closeModal() {
    modalOverlay.classList.remove('active');
    modal.classList.remove('active');
}

openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});