import { useState, useEffect } from "react";
import Notiflix from 'notiflix';

import galleryApi from '../services/gallery-api';

import Searchbar from './Searchbar/Searchbar';
import ImageGallery from "./ImageGallery/ImageGallery";
import Modal from "./Modal/Modal";
import ImageGalleryItem from "./ImageGallery/ImageGalleryItem/ImageGalleryItem";
import Loader from "./Loader/Loader";
import Button from "./Button/Button";
import ErrorMessage from "./ErrorMessage/ErrorMessage";


export const App = () => {
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle');
  const [gallery, setGallery] = useState([]);
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(1);
  const [loader, setLoader] = useState(false);
  const [showBtn, setShowBtn] = useState(false);

  useEffect(() => {
    if(!search) {
      return;
    }

    handleAPI(page);
  }, [search, page]);

  const onSubmitForm = (state) => {
    if (!state) {
      setStatus('rejected');
      setMessage('string must not be empty');
      return;
    }
    if (search === state) {
      Notiflix.Notify.info(`"${state}" already found.
      You can enter something new to search;)`);
      return;
    }
    setSearch(state);
    setStatus('pending');
    setGallery([]);
    setPage(1);
    setLoader(true);
    setShowBtn(false);
  }

  const onSelected = (e) => {
    if (e.target.src === undefined) {
      return;
    }

    setSelected({
      url: e.target.src, 
      alt: e.target.alt,
    })
  }

  const closeModal = () => {
    setSelected(null);
  }

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  }

  const handleAPI = (page) => {
    setLoader(true);

    galleryApi
      .fetchGallery(page, search)
      .then(data => {
        if (data.total === 0) {
          setStatus('rejected');
          setMessage('Nothing found for your request :(')
          return;
        }
        
        setGallery(prev => [ ...prev, ...data.hits]);
        setStatus('resolved');
        setShowBtn(page < Math.ceil(data.total / 12));
      })
      .catch(() => {
        setStatus('rejected')
        setMessage('Ooops... something went wrong :(')
      })
      .finally(() => setLoader(false))
}

return (
  <>
    <Searchbar onSubmit={onSubmitForm} />

    {status === 'pending' && 
      <Loader />
    }

    {status === 'rejected' && 
      <ErrorMessage message={message}/>
    }

    {status === 'resolved' && 
      <>
        <ImageGallery onSelected={onSelected}>

          {gallery !== null && gallery.map( 
            ({ id, largeImageURL, tags }) => <ImageGalleryItem key={id} url={largeImageURL} tags={tags} id={id} />)}

        </ImageGallery>

        {!loader
          ? <>{showBtn && <Button gallery={gallery} onClick={handleLoadMore}/>}</>
          : (<Loader />)}
      </>
    }

    {selected && (<Modal img={selected} closeModal={closeModal}/>)}
  </>
);
}
