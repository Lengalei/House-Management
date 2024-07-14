import { createContext, useEffect, useState } from 'react';
import { ThreeDots } from 'react-loader-spinner'; // Import loader

// Create a context to manage the script loading state
const CloudinaryScriptContext = createContext();

function UploadWidget({ uwConfig, onUploadSuccess, setLoading }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Check if the script is already loaded
    if (!loaded) {
      const uwScript = document.getElementById('uw');
      if (!uwScript) {
        // If not loaded, create and load the script
        const script = document.createElement('script');
        script.setAttribute('async', '');
        script.setAttribute('id', 'uw');
        script.src = 'https://upload-widget.cloudinary.com/global/all.js';
        script.addEventListener('load', () => setLoaded(true));
        document.body.appendChild(script);
      } else {
        // If already loaded, update the state
        setLoaded(true);
      }
    }
  }, [loaded]);

  const initializeCloudinaryWidget = () => {
    setLoading(true);
    if (loaded) {
      const myWidget = window.cloudinary.createUploadWidget(
        uwConfig,
        (error, result) => {
          setLoading(false);
          if (!error && result && result.event === 'success') {
            console.log('Done! Here is the image info:', result.info);
            console.log('Uploaded Document URL:', result.info.secure_url);
            onUploadSuccess(result.info.secure_url);
          }
        }
      );

      myWidget.open();
    }
  };

  return (
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      {loaded ? (
        <button
          type="button"
          id="upload_widget"
          className="cloudinary-button"
          onClick={initializeCloudinaryWidget}
        >
          Update Profile Pic
        </button>
      ) : (
        <ThreeDots color="#333" height={80} width={80} /> // Display loader while script is loading
      )}
    </CloudinaryScriptContext.Provider>
  );
}

export default UploadWidget;
export { CloudinaryScriptContext };
