import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
 
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string; // Assuming role is optional
}
 
interface ProfileFormData {
  name: string;
  avatar?: string;
  avatarFile?: File; // Add file property for upload
}
 
const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    avatar: undefined,
    avatarFile: undefined
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
 
  useEffect(() => {
    // Load user details from session storage
    const userDetails = sessionStorage.getItem('userdetails');
    if (userDetails) {
      try {
        const userData = JSON.parse(userDetails);
        setUser(userData);        
        setFormData({
          name: userData.name || '',
          avatar: '',
          avatarFile: undefined
        });
      } catch (error) {
        console.error('Error parsing user details:', error);
        navigate('/');
      }
    } else {
      navigate('/');
    }
  }, [navigate]);
 
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  };  const getAvatarImage = (user: Partial<User>, formDataAvatar?: string) => {
    if (formDataAvatar) {
       if (formDataAvatar.startsWith('/uploads/')) {
        return `http://localhost:4000${formDataAvatar}`;
      }
      return formDataAvatar;
    }
    if (user.avatar) {
      // Handle both relative URLs (from our API) and absolute URLs
      if (user.avatar.startsWith('/uploads/')) {
        return `http://localhost:4000${user.avatar}`;
      }
      return user.avatar;
    }    
    return "";
  };
 
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
 
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
   
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
     
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
 
      // Store the file for upload and create preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        avatarFile: file,
        avatar: previewUrl // Use for preview
      }));
    }
  };
  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      let updatedUser: Partial<User> = {
        name: formData.name,
      };
 
      // First, upload avatar if a new file was selected
      if (formData.avatarFile) {
        const avatarFormData = new FormData();
        avatarFormData.append('avatar', formData.avatarFile);
 
        const avatarRes = await axios.post(
          `http://localhost:4000/api/users/${user?.id}/avatar`,
          avatarFormData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );
 
        if (avatarRes.status === 200) {
          updatedUser.avatar = avatarRes.data.avatarUrl;
        }
      }
 
      // Update user profile via API (name and other fields)
      const res = await axios.patch(
        `http://localhost:4000/api/users/${user?.id}`,
        updatedUser,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
       
      if (res.status !== 200) {
        throw new Error('Failed to update profile');
      }
     
      // Clean up preview URL if it was created
      if (formData.avatar && formData.avatar.startsWith('blob:')) {
        URL.revokeObjectURL(formData.avatar);
      }
     
      // Update session storage with new data
      sessionStorage.setItem('userdetails', JSON.stringify(res.data));
      setUser(res.data);
      setFormData({
        name: res.data.name || '',
        avatar: res.data.avatar || '',
        avatarFile: undefined
      });
      setIsEditing(false);
     
      // Show success message (you can replace this with a proper toast/notification)
      alert('Profile updated successfully!');
     
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = () => {
    // Clean up preview URL if it was created
    if (formData.avatar && formData.avatar.startsWith('blob:')) {
      URL.revokeObjectURL(formData.avatar);
    }
   
    if (user) {      
      setFormData({
        name: user.name || '',
        avatar: user.avatar || '',
        avatarFile: undefined
      });
    }
    setErrors({});
    setIsEditing(false);
  };
 
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#E0F4FF] via-[#F4F5F7] to-[#FFEDE0] py-12 px-2 md:px-8 font-sans text-[15px] text-gray-800 flex items-center justify-center">
      <div className="w-full max-w-3xl mx-auto rounded-3xl shadow-2xl bg-white border-4 border-transparent bg-clip-padding p-0 relative" style={{boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'}}>
        {/* Top Icon Bar */}
        <div className="flex justify-between items-center px-6 pt-6 pb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white shadow border border-[#cceafb] hover:scale-110 active:scale-95 transition-all"
            title="Back"
            aria-label="Back"
            style={{width: '38px', height: '38px'}}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {isEditing && (
            <button
              onClick={handleCancel}
              className="p-2 rounded-full bg-gradient-to-r from-[#ffeaea] to-[#ffd6d6] text-red-600 shadow border border-red-200 hover:bg-red-100 hover:text-red-700 active:scale-95 transition-all"
              title="Cancel Edit"
              aria-label="Cancel Edit"
              style={{width: '38px', height: '38px'}}
              disabled={loading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        {/* Header */}
        <div className="px-8 pt-2 pb-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#156ba3] tracking-tight">Profile</h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold px-6 py-2 rounded-full shadow-md flex items-center gap-2 hover:scale-105 active:scale-95 transition-all text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z" /></svg>
              Edit Profile
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={loading}
              className="bg-gradient-to-r from-[#156ba3] to-[#67c1f2] text-white font-bold px-6 py-2 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all text-base"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
        {/* Profile Content */}
        <div className="p-8 flex flex-col md:flex-row gap-10 items-center md:items-start">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3 w-full md:w-auto">
            <div className="relative w-36 h-36 mb-2">
              {(formData.avatar && isEditing) || getAvatarImage(user) ? (
                <img
                  src={getAvatarImage(user, formData.avatar)}
                  alt={user.name}
                  className={`w-full h-full rounded-full object-cover border-4 border-[#67c1f2] shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={isEditing ? () => document.getElementById('avatar-upload')?.click() : undefined}
                />
              ) : (
                <div
                  className={`w-full h-full bg-gradient-to-br from-[#156ba3] to-[#67c1f2] text-white rounded-full flex items-center justify-center text-4xl font-extrabold border-4 border-[#67c1f2] shadow-lg ${isEditing ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                  onClick={isEditing ? () => document.getElementById('avatar-upload')?.click() : undefined}
                >
                  {getInitials(user?.name || '')}
                </div>
              )}
              {isEditing && (
                <>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="absolute inset-0 rounded-full bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center cursor-pointer"
                       onClick={() => document.getElementById('avatar-upload')?.click()}>
                    <svg className="w-8 h-8 text-white opacity-0 hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </>
              )}
            </div>
            {isEditing && (
              <button
                type="button"
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="text-[#156ba3] hover:text-[#67c1f2] text-sm font-semibold mt-1"
              >
                Upload New Photo
              </button>
            )}
          </div>
          {/* Profile Details */}
          <div className="flex-1 w-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-bold text-[#156ba3] mb-2 tracking-wide uppercase">Full Name</label>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#67c1f2] focus:border-transparent bg-gray-50 text-gray-900 font-semibold ${errors.name ? 'border-red-500' : 'border-gray-200'}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-lg text-gray-900 py-2 font-semibold">{user.name}</p>
                )}
              </div>
              {/* Email Field */}
              <div>
                <label className="block text-sm font-bold text-[#156ba3] mb-2 tracking-wide uppercase">Email Address</label>
                <p className="text-lg text-gray-900 py-2 font-semibold">{user.email}</p>
              </div>
              {/* User Role (Read-only) */}
              <div>
                <label className="block text-sm font-bold text-[#156ba3] mb-2 tracking-wide uppercase">Role</label>
                <p className="text-lg text-gray-600 py-2 font-semibold">{user?.role}</p>
              </div>
              {/* Join Date (if available) */}
              <div>
                <label className="block text-sm font-bold text-[#156ba3] mb-2 tracking-wide uppercase">Member Since</label>
                <p className="text-lg text-gray-600 py-2 font-semibold">
                  {new Date().toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Profile;