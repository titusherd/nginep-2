const form = document.querySelector('.review-form');
const nameInput = form.querySelector('input[type="text"]');
const starRating = form.querySelector('.star-rating');
const messageInput = form.querySelector('textarea');
const submitButton = form.querySelector('button[type="submit"]');
const stars = starRating.querySelectorAll('.star');

let currentRating = 4;
let isLoading = false;

const validateForm = () => {
    const isValid = nameInput.value.trim() !== '' &&
        messageInput.value.trim() !== '' &&
        currentRating > 0;
    submitButton.disabled = !isValid || isLoading;
};

[nameInput, messageInput].forEach(input => {
    input.addEventListener('input', validateForm);
});

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        currentRating = index + 1;
        updateStarDisplay();
        validateForm();
    });

    star.addEventListener('mouseover', () => {
        stars.forEach((s, i) => {
            s.classList.toggle('empty', i > index);
        });
    });

    star.addEventListener('mouseout', () => {
        updateStarDisplay();
    });
});

function updateStarDisplay() {
    stars.forEach((star, index) => {
        star.classList.toggle('empty', index >= currentRating);
    });
}

function resetForm() {
    form.reset();
    currentRating = 0;
    updateStarDisplay();
    validateForm();
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const data = {
        name: nameInput.value.trim(),
        rating: currentRating,
        message: messageInput.value.trim()
    };

    isLoading = true;
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    fetch('http://localhost:8080/reviews', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            resetForm();
            getReviewsData();
        })
        .catch(error => console.error('Error:', error))
        .finally(() => {
            isLoading = false;
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        });
});

async function getReviewsData() {
    const endpoint = "http://localhost:8080/reviews";

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        renderReviews(data);
    } catch (error) {
        console.error('Error fetching reviews:', error);
    }
}

function generateStarRating(rating) {
    return `<div class="rating-stars">
        ${'★'.repeat(rating)}${rating < 5 ? `<span class="empty">${'★'.repeat(5 - rating)}</span>` : ''}
    </div>`;
}

function renderReviews(data) {
    const tableBody = document.querySelector('.testimonials-table tbody');
    tableBody.innerHTML = '';

    if (!data.data || !Array.isArray(data.data)) {
        console.error('Invalid review data format');
        return;
    }

    data.data.forEach((review, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}.</td>
            <td>${review.name}</td>
            <td>${generateStarRating(review.rating)}</td>
            <td>${review.message}</td>
        `;
        tableBody.appendChild(row);
    });
}

validateForm();
document.addEventListener('DOMContentLoaded', getReviewsData);