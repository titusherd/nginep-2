const form = document.querySelector('.review-form');
const nameInput = form.querySelector('input[type="text"]');
const starRating = form.querySelector('.star-rating');
const messageInput = form.querySelector('textarea');
const submitButton = form.querySelector('button[type="submit"]');
const stars = starRating.querySelectorAll('.star');

let currentRating = 0;
let isLoading = false;
let currentPage = 1;
const reviewsPerPage = 10;

function createErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.style.color = 'red';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '4px';
    errorDiv.textContent = message;
    return errorDiv;
}

function showError(element, message) {
    let errorDiv = element.nextElementSibling;
    if (errorDiv?.classList.contains('error-message')) {
        errorDiv.textContent = message;
    } else {
        element.insertAdjacentElement('afterend', createErrorMessage(message));
    }
}

function clearError(element) {
    const errorDiv = element.nextElementSibling;
    if (errorDiv?.classList.contains('error-message')) {
        errorDiv.remove();
    }
}

function validateField(element) {
    clearError(element);
    let isValid = true;

    switch(element) {
        case nameInput:
            if (element.value.trim().length > 0 && element.value.trim().length < 3) {
                showError(element, 'Name must be at least 3 characters long');
                isValid = false;
            }
            break;
        case starRating:
            if (currentRating === 0) {
                showError(element, 'Please select a rating');
                isValid = false;
            }
            break;
        case messageInput:
            if (element.value.trim().length > 0 && element.value.trim().length < 10) {
                showError(element, 'Message must be at least 10 characters long');
                isValid = false;
            }
            break;
    }

    return isValid;
}

const validateForm = () => {
    let isValid = true;

    // For submit validation, we need to check empty fields too
    if (nameInput.value.trim().length === 0) {
        showError(nameInput, 'Name is required');
        isValid = false;
    } else {
        isValid = validateField(nameInput) && isValid;
    }

    if (currentRating === 0) {
        showError(starRating, 'Please select a rating');
        isValid = false;
    }

    if (messageInput.value.trim().length === 0) {
        showError(messageInput, 'Message is required');
        isValid = false;
    } else {
        isValid = validateField(messageInput) && isValid;
    }

    submitButton.disabled = !isValid || isLoading;
    return isValid;
};

[nameInput, messageInput].forEach(input => {
    input.addEventListener('input', () => validateField(input));
});

stars.forEach((star, index) => {
    star.addEventListener('click', () => {
        currentRating = index + 1;
        updateStarDisplay();
        validateField(starRating);
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
    clearError(nameInput);
    clearError(starRating);
    clearError(messageInput);
}

function updatePagination(totalReviews) {
    const pagination = document.querySelector('.pagination');
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);

    pagination.innerHTML = `
        <a href="#" class="prev" ${currentPage === 1 ? 'disabled' : ''}>&lt;</a>
        ${[...Array(totalPages)].map((_, i) => `
            <a href="#" class="page-number ${currentPage === i + 1 ? 'active' : ''}">${i + 1}</a>
        `).join('')}
        <a href="#" class="next" ${currentPage === totalPages ? 'disabled' : ''}>&gt;</a>
    `;

    pagination.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            if (a.hasAttribute('disabled')) return;

            if (a.classList.contains('prev')) currentPage--;
            else if (a.classList.contains('next')) currentPage++;
            else currentPage = parseInt(a.textContent);

            getReviewsData();
        });
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
            currentPage = 1;
            getReviewsData();
        })
        .catch(error => {
            console.error('Error:', error);
            showError(submitButton, 'Failed to submit review. Please try again.');
        })
        .finally(() => {
            isLoading = false;
            submitButton.disabled = false;
            submitButton.textContent = 'Submit';
        });
});

async function getReviewsData() {
    const endpoint = `http://localhost:8080/reviews?page=${currentPage}&limit=${reviewsPerPage}`;

    try {
        const response = await fetch(endpoint);
        const data = await response.json();
        renderReviews(data);
        updatePagination(data.total || data.data.length);
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
            <td>${(currentPage - 1) * reviewsPerPage + index + 1}.</td>
            <td>${review.name}</td>
            <td>${generateStarRating(review.rating)}</td>
            <td>${review.message}</td>
        `;
        tableBody.appendChild(row);
    });
}

document.addEventListener('DOMContentLoaded', getReviewsData);