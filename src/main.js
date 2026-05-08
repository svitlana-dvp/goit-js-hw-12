import { getImagesByQuery } from './js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from './js/render-functions.js';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.form'); // форма з класом form
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalHits = 0;

form.addEventListener('submit', async e => {
  e.preventDefault();
  query = e.target.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.error({ message: 'Please enter a search term!' });
    return;
  }

  clearGallery();
  hideLoadMoreButton();
  page = 1;

  await fetchImages();
});

loadMoreBtn.addEventListener('click', async () => {
  // ❗ ховаємо кнопку одразу, щоб її не можна було натиснути повторно під час завантаження
  hideLoadMoreButton();
  page += 1;
  await fetchImages(true);
});

async function fetchImages(isLoadMore = false) {
  try {
    showLoader();
    const data = await getImagesByQuery(query, page);

    if (data.hits.length === 0) {
      // якщо немає результатів на додаткових сторінках → це кінець колекції
      if (isLoadMore) {
        iziToast.info({
          message: "We're sorry, but you've reached the end of search results.",
        });
        hideLoadMoreButton();
      } else {
        iziToast.warning({ message: 'No images found!' });
      }
      return;
    }

    createGallery(data.hits);
    totalHits = data.totalHits;

    if (page * 15 >= totalHits) {
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
      });
    } else {
      showLoadMoreButton();
    }

    if (isLoadMore) smoothScroll();
  } catch (error) {
    iziToast.error({ message: 'Something went wrong!' });
    console.error(error);
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const { height } = document
    .querySelector('.gallery-item')
    .getBoundingClientRect();

  window.scrollBy({
    top: height * 2,
    behavior: 'smooth',
  });
}
