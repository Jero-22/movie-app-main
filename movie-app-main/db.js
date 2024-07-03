// Variables globales y constantes
const apiKey = 'be44a215037f455f99b75dc0565d5058';
const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=`;
const imgUrl = 'https://image.tmdb.org/t/p/w500';
const movieList = document.getElementById('movieList');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const favoritesButton = document.getElementById('favoritesButton');
const movieModal = document.getElementById('movieModal');
const movieDetails = document.getElementById('movieDetails');
const favoriteButton = document.getElementById('favoriteButton');
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Event listeners al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    searchButton.addEventListener('click', handleSearch);
    favoritesButton.addEventListener('click', showFavorites);
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', outsideModalClick);
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(() => console.log('Service Worker Registered'))
            .catch(error => console.error('Service Worker Registration Failed:', error));
    }
});

// Función para manejar la búsqueda de películas
function handleSearch() {
    const query = searchInput.value.trim();
    if (query) {
        fetchMovies(query);
    }
}

// Función para mostrar películas favoritas
function showFavorites() {
    displayMovies(favorites);
}

// Función para obtener y mostrar películas desde la API
function fetchMovies(query) {
    fetch(apiUrl + query)
        .then(response => response.json())
        .then(data => displayMovies(data.results))
        .catch(error => console.error('Error fetching movies:', error));
}

// Función para mostrar las películas en el DOM
function displayMovies(movies) {
    movieList.innerHTML = '';
    if (movies.length === 0) {
        movieList.innerHTML = '<p>No movies found.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieItem = createMovieElement(movie);
        movieList.appendChild(movieItem);
    });
}

// Función para crear el elemento HTML de una película
function createMovieElement(movie) {
    const movieItem = document.createElement('div');
    movieItem.classList.add('movie-item');
    movieItem.innerHTML = `
        <img src="${imgUrl + movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.overview}</p>
        <button onclick="showMovieDetails(${movie.id})">Details</button>
    `;
    return movieItem;
}

// Función para mostrar los detalles de una película
function showMovieDetails(movieId) {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${apiKey}&append_to_response=credits`)
        .then(response => response.json())
        .then(movie => {
            displayMovieDetails(movie);
            setupFavoriteButton(movie);
            openModal();
        })
        .catch(error => console.error('Error fetching movie details:', error));
}

// Función para mostrar los detalles de la película en el modal
function displayMovieDetails(movie) {
    const releaseDate = new Date(movie.release_date);
    const formattedDate = releaseDate.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    movieDetails.innerHTML = `
        <img src="${imgUrl + movie.poster_path}" alt="${movie.title}">
        <h2>${movie.title}</h2>
        <p><strong>Año de Estreno:</strong> ${formattedDate}</p>
        <p><strong>Duración:</strong> ${movie.runtime} minutos</p>
        <p><strong>Director(es):</strong> ${getDirectors(movie)}</p>
        <p>${movie.overview}</p>
    `;
}

// Función para obtener los nombres de los directores de la película
function getDirectors(movie) {
    if (!movie.credits || !movie.credits.crew) {
        return 'Desconocido';
    }

    const directors = movie.credits.crew.filter(member => member.job === 'Director');
    if (directors.length === 0) {
        return 'Desconocido';
    }

    return directors.map(director => director.name).join(', ');
}

// Función para configurar el botón de favoritos en el modal
function setupFavoriteButton(movie) {
    favoriteButton.textContent = favorites.some(fav => fav.id === movie.id) ? 'Eliminar de Favoritos' : 'Agregar a Favoritos';
    favoriteButton.onclick = () => toggleFavorite(movie);
}

// Función para agregar o eliminar una película de favoritos
function toggleFavorite(movie) {
    const index = favorites.findIndex(fav => fav.id === movie.id);
    if (index === -1) {
        favorites.push({ id: movie.id, title: movie.title, poster_path: movie.poster_path });
    } else {
        favorites.splice(index, 1);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setupFavoriteButton(movie);
}

// Función para abrir el modal
function openModal() {
    movieModal.style.display = 'block';
}

// Función para cerrar el modal
function closeModal() {
    movieModal.style.display = 'none';
}

// Función para cerrar el modal al hacer clic fuera de él
function outsideModalClick(event) {
    if (event.target === movieModal) {
        closeModal();
    }
}
// Variables globales y constantes (previamente definidas)

// Event listener para el botón de búsqueda
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    const genre = genreSelect.value;
    if (query) {
        fetchMovies(query, genre);
    } else {
        fetchMovies('', genre); // Si no hay una búsqueda específica, solo se filtra por género
    }
});

