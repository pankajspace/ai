(() => {
    const backToTop = document.querySelector('.back-to-top');
    if (!backToTop) {
        return;
    }

    const updateScroll = () => {
        backToTop.classList.toggle('visible', window.scrollY > 600);
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateScroll();
})();
