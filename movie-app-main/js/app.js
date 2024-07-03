// Variables globales y constantes
const apiKey = 'ede8cce56742f23ab3b3f91c43847267'; // Reemplaza con tu API key válida
const apiUrl = 'https://api.themoviedb.org/3';
const imageUrl = 'https://image.tmdb.org/t/p/w500'; // Tamaño de imagen deseado

const movieListElement = document.getElementById('movieList');
const searchInput = document.getElementById('searchInput');
const searchButton = document.getElementById('searchButton');
const favoritesButton = document.getElementById('favoritesButton');
const favoritesElement = document.getElementById('favoritesList'); // Elemento para mostrar favoritos

let movies = []; // Variable para almacenar las películas cargadas
let favorites = JSON.parse(localStorage.getItem('favorites')) || []; // Cargar favoritos desde localStorage

// Función para obtener películas populares de la API
async function fetchPopularMovies() {
    try {
        const response = await fetch(`${apiUrl}/movie/popular?api_key=${apiKey}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching popular movies:', error);
        return [];
    }
}

// Función para buscar películas por término de búsqueda
async function fetchMovies(query) {
    try {
        const response = await fetch(`${apiUrl}/search/movie?api_key=${apiKey}&query=${query}`);
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

// Función para mostrar la lista de películas
function displayMovies(moviesToDisplay) {
    movieListElement.innerHTML = '';
    moviesToDisplay.forEach(movie => {
        const movieElement = createMovieElement(movie);
        movieListElement.appendChild(movieElement);
    });
}

// Función para crear un elemento de película
function createMovieElement(movie) {
    const movieElement = document.createElement('div');
    movieElement.classList.add('movie-card');
    movieElement.innerHTML = `
        <img src="${imageUrl}${movie.poster_path}" alt="${movie.title}" />
        <div class="movie-details">
            <h3>${movie.title}</h3>
            <p>${movie.overview}</p>
            <button class="button-favorites ${isFavorite(movie) ? 'button-remove' : ''}" onclick="toggleFavorite(${movie.id})">${isFavorite(movie) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</button>
        </div>
    `;
    movieElement.addEventListener('click', () => showMovieDetails(movie));
    return movieElement;
}

// Función para mostrar los detalles de una película en un modal
function showMovieDetails(movie) {
    document.getElementById('modalTitle').innerText = movie.title;
    document.getElementById('modalDescription').innerText = movie.overview;
    document.getElementById('modalGenre').innerText = 'Cargando...'; // Este campo necesita ser mejorado
    document.getElementById('modalYear').innerText = movie.release_date ? movie.release_date.split('-')[0] : 'Desconocido';
    document.getElementById('modalDirector').innerText = 'Cargando...'; // Necesita ser ajustado según datos de la API
    document.getElementById('modalDuration').innerText = `${movie.runtime ? movie.runtime : 'Desconocida'} min`;

    const modal = document.getElementById('movieDetailsModal');
    modal.style.display = 'block';

    // Actualizar el botón de favoritos en el modal
    const toggleFavoriteButton = modal.querySelector('#toggleFavoriteButton');
    toggleFavoriteButton.innerText = isFavorite(movie) ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
    toggleFavoriteButton.classList.toggle('button-remove', isFavorite(movie));

    // Manejar evento click en el botón de favoritos del modal
    toggleFavoriteButton.onclick = () => {
        toggleFavorite(movie.id);
        toggleFavoriteButton.innerText = isFavorite(movie) ? 'Quitar de Favoritos' : 'Agregar a Favoritos';
        toggleFavoriteButton.classList.toggle('button-remove', isFavorite(movie));
    };

    // Cerrar modal al hacer clic en la "X"
    modal.querySelector('.close').addEventListener('click', () => modal.style.display = 'none');
}

// Función para verificar si una película está en la lista de favoritos
function isFavorite(movie) {
    return favorites.some(favorite => favorite.id === movie.id);
}

// Función para agregar o quitar una película de la lista de favoritos
function toggleFavorite(movieId) {
    const index = favorites.findIndex(movie => movie.id === movieId);
    if (index === -1) {
        // No está en favoritos, agregarlo
        const movieToAdd = movies.find(movie => movie.id === movieId);
        favorites.push(movieToAdd);
    } else {
        // Ya está en favoritos, quitarlo
        favorites.splice(index, 1);
    }
    // Actualizar localStorage
    localStorage.setItem('favorites', JSON.stringify(favorites));
    // Actualizar listas de películas y de favoritos mostradas
    displayMovies(movies);
    displayFavorites();
}

// Función para mostrar la lista de favoritos
function displayFavorites() {
    favoritesElement.innerHTML = '';
    favorites.forEach(movie => {
        const favoriteElement = createMovieElement(movie);
        favoritesElement.appendChild(favoriteElement);
    });
}

// Manejadores de eventos
searchButton.addEventListener('click', async () => {
    const query = searchInput.value.trim();
    if (query) {
        movies = await fetchMovies(query); // Actualizar la lista de películas cargadas
        displayMovies(movies);
    }
});

favoritesButton.addEventListener('click', () => {
    movieListElement.style.display = 'none';
    favoritesElement.style.display = 'grid';
    displayFavorites();
});

// Función inicializadora
async function initialize() {
    movies = await fetchPopularMovies(); // Obtener películas populares al inicio
    displayMovies(movies);
}

// Inicialización al cargar la página
initialize();
