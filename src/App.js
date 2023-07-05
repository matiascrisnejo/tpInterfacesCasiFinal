import React, { useEffect, useState } from 'react';
import axios from 'axios';  //nos permite hace peticiones al contenido de un  enlace HTTP
import YouTube from 'react-youtube';  // para implementar youtube video
import './App.css';
import Header from './components/Header';
import Footer from './components/Footer';
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const API_URL = "http://api.themoviedb.org/3"
  const API_KEY = "8566e4cbc8d8b832abd6ff48928cdf6b"
  const IMAGE_PATH = "https://image.tmdb.org/t/p/original"
  const URL_IMAGE = "https://image.tmdb.org/t/p/original"

  // VARIABLES DE ESTADOS
  const [movies, setMovies] = useState([]);
  const [searchKey, setSearchKey] = useState("");
  const [trailer, setTrailer] = useState(null);
  const [movie, setMovie] = useState({ title: "Loading Movies" });
  const [playing, setPlaying] = useState(false);


  // funcion para realizar la peticion por get de un solo objeto a la api
  const fetchMovies = async (searchKey) => {
    const type = searchKey ? "search" : "discover";   //si estamos buscando una peli o si queremos saber cuales son las nuevas
    const {
      data: { results },    //de data quiero los datos destructurados
    } = await axios.get(`${API_URL}/${type}/movie`, {
      params: {
        api_key: API_KEY,
        query: searchKey,
      },
    });

    setMovies(results)
    setMovie(results[0])

    if (results.length) {
      await fetchMovie(results[0].id)
    }
  }

  // funcion para la peticion de un solo objeto y mostrar en reproductor de video
  const fetchMovie = async (id) => {
    const { data } = await axios.get(`${API_URL}/movie/${id}`, {
      params: {
        api_key: API_KEY,
        append_to_response: "videos"
      }
    })

    if (data.videos && data.videos.results) {
      const trailer = data.videos.results.find(
        (vid) => vid.name === "Official Trailer"
      );
      setTrailer(trailer ? trailer : data.videos.results[0])  //valido para no tener resultado con error
    }
    setMovie(data)    //return data
  }

  const selectMovie = async (movie) => {
    fetchMovie(movie.id)
    setMovie(movie)
    window.scrollTo(0, 0)
  }

  // funcion para buscar peliculas
  const searchMovies = (e) => {
    e.preventDefault();       //para que no permita que la pagina se este recargando 
    fetchMovies(searchKey)    //cada vez q hacemos la peticion
  }


  useEffect(() => {
    fetchMovies();
  }, [])



  return (

    <div>
      <Header />
      <h2 className="text-center mt-5 mb-5">Trailer Movies</h2>
      {/* buscador */}
      <div className="formulario">
        <form className="d-flex" role="search" onSubmit={searchMovies}>
          <input className="form-control me-2"
            type="search"
            placeholder="Search"
            aria-label="Search"
            onChange={(e) => setSearchKey(e.target.value)} />
          <button className="btn btn-outline-success" type="submit">Search</button>
        </form>
      </div>

      {/* contenedor de banner y del reproductor */}
      <div>
        <main>
          {movie ? (
            <div
              className="viewtrailer"
              style={{
                backgroundImage: `url("${IMAGE_PATH}${movie.backdrop_path}")`,
              }}
            >
              {playing ? (
                <>
                  <YouTube
                    videoId={trailer.key}
                    className="reproductor container"
                    containerClassName={"youtube-container amru"}
                    opts={{
                      width: "100%",
                      height: "100%",
                      playerVars: {
                        autoplay: 1,
                        controls: 0,
                        cc_load_policy: 0,
                        fs: 0,
                        iv_load_policy: 0,
                        modestbranding: 0,
                        rel: 0,
                        showinfo: 0,
                      },
                    }}
                  />
                  <button onClick={() => setPlaying(false)} className="boton">
                    Close
                  </button>
                </>
              ) : (
                <div className="container">
                  <div className="">
                    {trailer ? (
                      <button
                        className="btn btn-outline-dark"
                        onClick={() => setPlaying(true)}
                        type="button"
                      >
                        Play Trailer
                      </button>
                    ) : (
                      "Sorry, no trailer available"
                    )}
                    <h1 className="text-white">{movie.title}</h1>
                    <p className="text-white">{movie.overview}</p>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </main>
      </div>
      {/* contenedor que va mostrar posters de las pelis actuales */}
      <div className="container mt-3">
        <div className="row">
          {movies.map((movie) => (
            <div key={movie.id} className="col-md-4 mb-3" onClick={() => selectMovie(movie)}>
              <img src={`${URL_IMAGE + movie.poster_path}`} alt="" height={600} width="100%" />
              <h4 className="text-center">
                {movie.title}
              </h4>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
