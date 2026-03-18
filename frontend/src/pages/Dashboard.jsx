import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({ fullName: '', email: '' });
    const [passwordData, setPasswordData] = useState({ newPassword: '' });
    const [selectedFile, setSelectedFile] = useState(null);
    const [photoTimestamp, setPhotoTimestamp] = useState(Date.now()); // Forces image to refresh after upload

    useEffect(() => {
        const username = localStorage.getItem('username');
        if (!username) return navigate('/login');
        fetchUserData(username);
    }, [navigate]);

    const fetchUserData = async (username) => {
        try {
            const res = await fetch(`http://localhost:8080/api/users/profile/${username}`);
            if (res.ok) {
                const data = await res.json();
                setUser(data);
                setFormData({ fullName: data.fullName, email: data.email });
            } else {
                navigate('/login');
            }
        } catch (err) {
            setMessage({ text: 'Error connecting to database.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUser(updatedUser);
                setEditMode(false);
                setMessage({ text: 'Profile updated successfully!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to update profile.', type: 'error' });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`http://localhost:8080/api/users/password/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            });
            if (res.ok) {
                setPasswordData({ newPassword: '' });
                setMessage({ text: 'Password secured and updated!', type: 'success' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to update password.', type: 'error' });
        }
    };

    const handlePhotoUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) return setMessage({ text: 'Please select an image first.', type: 'error' });

        const uploadData = new FormData();
        uploadData.append('file', selectedFile);

        try {
            const res = await fetch(`http://localhost:8080/api/users/photo/${user.id}`, {
                method: 'POST',
                body: uploadData
            });
            if (res.ok) {
                setPhotoTimestamp(Date.now()); // Refreshes the image tag automatically
                setSelectedFile(null);
                setMessage({ text: 'Profile photo updated!', type: 'success' });
            } else {
                const errText = await res.text();
                setMessage({ text: errText || 'Failed to upload photo.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Failed to upload photo.', type: 'error' });
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    if (loading) return <div className="page-container"><h2 style={{color: 'white'}}>Loading...</h2></div>;

    return (
        <div className="page-container">
            <div className="brand-header" style={{ marginBottom: '15px' }}>
                <h1>CampusCrave</h1>
                <p>Dashboard & Profile Settings</p>
            </div>

            <div className="auth-container" style={{ maxWidth: '600px', width: '100%', textAlign: 'left' }}>
                
                {/* Dynamic Message Box */}
                {message.text && (
                    <div style={{
                        padding: '10px', marginBottom: '20px', borderRadius: '5px', textAlign: 'center', fontWeight: 'bold',
                        backgroundColor: message.type === 'error' ? '#fdf7f7' : '#eaf8f0',
                        color: message.type === 'error' ? '#d9534f' : '#28a745',
                        border: `1px solid ${message.type === 'error' ? '#d9534f' : '#28a745'}`
                    }}>
                        {message.text}
                    </div>
                )}

                {/* Profile Photo Display (Uses your new backend GET endpoint) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
                    {user?.profileImage ? (
                        <img 
                            src={`http://localhost:8080/api/users/photo/${user.id}?t=${photoTimestamp}`} 
                            alt="Profile" 
                            style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #ff7a00', marginBottom: '10px' }} 
                        />
                    ) : (
                        <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                            <span style={{ color: '#aaa' }}>No Photo</span>
                        </div>
                    )}
                    <h2 style={{ marginBottom: '0' }}>{user?.fullName}</h2>
                    <p style={{ marginTop: '5px', color: '#666' }}>@{user?.username}</p>
                </div>

                <hr style={{ border: '0', borderTop: '1px solid #eee', marginBottom: '20px' }} />

                {/* Tab Switcher: View vs Edit */}
                {!editMode ? (
                    <div>
                        <p style={{ fontSize: '15px' }}><strong>Email:</strong> {user?.email}</p>
                        <button onClick={() => setEditMode(true)} style={{ width: '100%', marginBottom: '10px' }}>Edit Profile & Settings</button>
                        <button onClick={handleLogout} style={{ width: '100%', background: '#333', boxShadow: 'none' }}>Logout</button>
                    </div>
                ) : (
                    <div>
                        <h3 style={{ borderBottom: '2px solid #ff7a00', paddingBottom: '5px' }}>Update Details</h3>
                        <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} required placeholder="Full Name"/>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required placeholder="Email Address"/>
                            <button type="submit">Save Details</button>
                        </form>

                        <h3 style={{ borderBottom: '2px solid #ff7a00', paddingBottom: '5px' }}>Update Password</h3>
                        <form onSubmit={handlePasswordUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                            <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({newPassword: e.target.value})} required placeholder="New Password"/>
                            <button type="submit">Change Password</button>
                        </form>

                        <h3 style={{ borderBottom: '2px solid #ff7a00', paddingBottom: '5px' }}>Upload Photo</h3>
                        <form onSubmit={handlePhotoUpload} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <input type="file" accept=".jpg,.png,.jpeg" onChange={(e) => setSelectedFile(e.target.files[0])} style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '5px' }} />
                            <button type="submit">Upload Photo</button>
                        </form>

                        <button onClick={() => setEditMode(false)} style={{ width: '100%', background: '#ccc', color: '#333', marginTop: '20px', boxShadow: 'none' }}>Cancel / Go Back</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;