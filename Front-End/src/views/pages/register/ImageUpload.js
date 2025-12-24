import React, { useState, useRef } from 'react';
import { CImage, CButton } from '@coreui/react';

const ImageUpload = ({ selectedImage, setSelectedImage }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (JPEG, PNG, etc.)');
      return;
    }

    // Store the file in parent component state
    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ 
      position: 'absolute', 
      top: '12px', 
      right: '25px', 
      textAlign: 'center',
      zIndex: 10 
    }}>
      {/* Preview Image */}
      <div style={{ marginBottom: '10px' }}>
        {previewUrl ? (
          <CImage 
            src={previewUrl} 
            alt="Preview" 
            style={{ 
              width: '100px', 
              height: '100px', 
              objectFit: 'cover',
              border: '2px solid #dee2e6',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div 
            style={{
              width: '100px',
              height: '100px',
              border: '2px dashed #dee2e6',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              color: '#6c757d',
              fontSize: '12px',
              textAlign: 'center',
              padding: '5px'
            }}
          >
            No image selected
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />
      
      {/* Select File Button */}
      <CButton 
        color="secondary" 
        size="sm" 
        variant="outline" 
        onClick={triggerFileInput}
        style={{ width: '100px' }}
      >
        Select Image
      </CButton>

      {/* Info text */}
      {previewUrl && (
        <div style={{ 
          fontSize: '11px', 
          marginTop: '8px',
          color: '#28a745'
        }}>
          Image ready to upload
        </div>
      )}
    </div>
  );
};

export default ImageUpload;