import React from 'react';
import Image from 'next/image';
import Dom from '../../public/Dom.png';

export default function WordArt() {
  return (
    <>
      <div className="flex justify-center items-center">
        <Image 
          src={Dom} 
          alt="Dom" 
          width={600}
          height={600}
        />
      </div>
    </>
  );
}