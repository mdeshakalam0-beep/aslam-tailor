import React from 'react';
import { Link } from 'react-router-dom';

const Profile: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-3xl font-bold mb-4 text-foreground">आपकी प्रोफ़ाइल</h1>
      <p className="text-lg text-muted-foreground mb-6 text-center">
        यहाँ आप अपनी प्रोफ़ाइल जानकारी देख और संपादित कर सकते हैं।
      </p>
      <Link to="/" className="text-primary hover:underline">
        होम पर वापस जाएँ
      </Link>
    </div>
  );
};

export default Profile;