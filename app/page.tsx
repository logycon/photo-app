'use client';

import { useState } from 'react';
import UploadPhoto from './components/UploadPhoto';
import PhotoFilters from './components/PhotoFilters';
import './globals.css';

const Home: React.FC = () => {
  const [photo, setPhoto] = useState<string | null>(null);
  const [filteredPhoto, setFilteredPhoto] = useState<string | null>(null);

  const handleUpload = (uploadedPhoto: string) => {
    setPhoto(uploadedPhoto);
    setFilteredPhoto(uploadedPhoto);
  };

  const handleFilterApplied = (filteredPhoto: string) => {
    setFilteredPhoto(filteredPhoto);
  };

  const downloadPhoto = () => {
    if (filteredPhoto) {
      const link = document.createElement('a');
      link.href = filteredPhoto;
      link.download = 'filtered-photo.png';
      link.click();
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Apply Filters to your Photo</h1>
      {!photo && <UploadPhoto onUpload={handleUpload} />}
      {photo && (
        <>
          <PhotoFilters photo={photo} onFilterApplied={handleFilterApplied} />
          <button onClick={downloadPhoto}>Download Photo</button>
        </>
      )}
    </div>
  );
};

export default Home;