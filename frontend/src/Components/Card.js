import React, { useContext } from 'react';
import { userdataContext } from '../Contexts/UserContext';

function Card({ image }) {
  const { selectedImage, setSelectedImage, setFrontendImage, setBackendImage } = useContext(userdataContext);
  const isSelected = selectedImage === image;

  return (
    <div
      onClick={() => {
        setSelectedImage(image);
        setFrontendImage(null);
        setBackendImage(null);
      }}
      className={`relative w-[80px] h-[130px] lg:w-[130px] lg:h-[210px] rounded-2xl overflow-hidden cursor-pointer
        border-2 transition-all duration-300 group
        ${isSelected
          ? 'border-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.6)] scale-105'
          : 'border-white/10 hover:border-indigo-500/40 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:scale-102'
        }`}
    >
      <img src={image} alt="assistant avatar" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

      {/* Gradient overlay on hover */}
      <div className={`absolute inset-0 transition-opacity duration-300 ${
        isSelected ? 'opacity-30' : 'opacity-0 group-hover:opacity-20'
      } bg-gradient-to-b from-indigo-500 to-transparent`} />

      {/* Selected checkmark */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shadow-lg">
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default Card;
