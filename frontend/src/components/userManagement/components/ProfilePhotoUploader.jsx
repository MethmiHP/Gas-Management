import React, { useState, useRef } from 'react';
import { FiCamera } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { UserService } from '../services/userService';

const ProfilePhotoUploader = ({ currentAvatarUrl, onPhotoUpdated }) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image file size must be less than 2MB');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      // Create form data
      const formData = new FormData();
      formData.append('avatar', file);

      // Call API to upload photo
      const response = await UserService.uploadProfilePhoto(formData);
      
      if (response && response.success) {
        toast.success('Profile photo updated successfully');
        if (onPhotoUpdated && response.data && response.data.avatarUrl) {
          onPhotoUpdated(response.data.avatarUrl);
        }
      } else {
        toast.error('Failed to update profile photo');
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error(error.response?.data?.message || 'Error uploading profile photo');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="relative">
      <img 
        src={previewUrl || currentAvatarUrl || "/assets/images/nelson-gas-logo.png"} 
        alt="Profile" 
        className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
      />
      <button 
        onClick={handleClick}
        disabled={uploading}
        className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
        title="Upload new photo"
        type="button"
      >
        {uploading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <FiCamera size={16} />
        )}
      </button>
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default ProfilePhotoUploader;
