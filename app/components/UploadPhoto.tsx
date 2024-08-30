import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadPhotoProps {
  onUpload: (photo: string) => void;
}

const UploadPhoto: React.FC<UploadPhotoProps> = ({ onUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = () => {
      onUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [onUpload]);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>Drag 'n' drop a photo here, or click to select one</p>
    </div>
  );
};

export default UploadPhoto;