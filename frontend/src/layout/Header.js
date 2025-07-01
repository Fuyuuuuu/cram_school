// frontend/src/layout/Header.js
import React from 'react';

const Header = ({ currentPage, handleNavigationClick }) => {
  return (
    <nav className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 shadow-lg">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <h1 className="text-white text-3xl font-bold rounded-lg px-2 py-1">補習班管理系統</h1>
        <div className="flex flex-wrap space-x-2 md:space-x-4 mt-2 md:mt-0">
          <button
            onClick={() => handleNavigationClick('students')}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
              ${currentPage === 'students' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
          >
            學生管理
          </button>
          <button
            onClick={() => handleNavigationClick('classes')}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
              ${currentPage === 'classes' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
          >
            課堂系統
          </button>
          <button
            onClick={() => handleNavigationClick('finance')}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
              ${currentPage === 'finance' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
          >
            財務管理
          </button>
          <button
            onClick={() => handleNavigationClick('calendar')}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
              ${currentPage === 'calendar' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
          >
            日曆總覽
          </button>
          <button
            onClick={() => handleNavigationClick('history')}
            className={`px-3 py-2 md:px-5 md:py-2 rounded-lg transition-all duration-300 ease-in-out text-sm md:text-base
              ${currentPage === 'history' ? 'bg-white text-blue-700 shadow-md' : 'text-white hover:bg-blue-500 hover:shadow-md'}
              focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75`}
          >
            歷史課程
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Header;