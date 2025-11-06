class CatSlider {
    constructor() {
        this.catImages = [
            { src: 'images/cats/cat1.jpg', text: 'Разбуженный котёнок' },
            { src: 'images/cats/cat2.jpg', text: 'Мудрые котята' },
            { src: 'images/cats/cat3.jpg', text: 'Котёнок на стуле' },
            { src: 'images/cats/cat4.jpg', text: 'Сытый котёнок' },
            { src: 'images/cats/cat5.jpg', text: 'Принципиальный котёнок' },
            { src: 'images/cats/cat6.jpg', text: 'Дружелюбные котята' },
            { src: 'images/cats/cat7.jpg', text: 'Кот-айтишник' },
            { src: 'images/cats/cat8.jpg', text: 'Кот-студент' },
            { src: 'images/cats/cat9.jpg', text: 'Спящий котёнок' },
            { src: 'images/cats/cat10.jpg', text: 'Свободный котёнок' },
        ];

        this.currentSlide = 0;
        this.catImage = document.getElementById('current-cat-image');
        this.catText = document.querySelector('.slide p');
        this.dots = document.querySelectorAll('.dot');
        this.prevBtn = document.querySelector('.prev-btn');
        this.nextBtn = document.querySelector('.next-btn');

        this.init();
    }

    init() {
        this.prevBtn.addEventListener('click', () => this.prevSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());

        this.dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                const slideIndex = parseInt(e.target.getAttribute('data-slide'));
                this.goToSlide(slideIndex);
            });
        });

        this.updateSlider();
    }

    prevSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.catImages.length - 1 : this.currentSlide - 1;
        this.updateSlider();
    }

    nextSlide() {
        this.currentSlide = this.currentSlide === this.catImages.length - 1 ? 0 : this.currentSlide + 1;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }

    updateSlider() {
        const currentCat = this.catImages[this.currentSlide];

        this.catImage.src = currentCat.src;
        this.catImage.alt = currentCat.text;
        this.catText.textContent = currentCat.text;

        this.dots.forEach(dot => dot.classList.remove('active'));
        this.dots[this.currentSlide].classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CatSlider();
});