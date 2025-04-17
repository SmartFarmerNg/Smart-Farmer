import React from 'react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-200 text-gray-900 font-sans z-50">
      <h1 className="text-4xl font-bold bg-white shadow-md px-8 py-4 rounded-2xl border border-gray-300">
        404 - Page Not Found
      </h1>
      <p className="text-lg text-gray-600 mt-4">Oops! The page you're looking for doesn't exist.</p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-600 transition"
      >
        Go Back
      </button>
    </div>
  );
};

export default NotFound;
