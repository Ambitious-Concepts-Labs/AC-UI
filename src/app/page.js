"use client";
import Head from 'next/head';
import { FaGithub, FaLinkedin, FaCube, FaInstagram, FaTwitter } from 'react-icons/fa';
import { useState } from 'react';
import WordArt from '@/components/WordArt';

export default function Home() {
  const [activeLink, setActiveLink] = useState('01. About');
  
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200">
      <Head>
        <title>Ambitious Concepts | AWS Cost Optimization</title>
        <meta name="description" content="Personal portfolio website" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="flex justify-between items-center mb-20">
          <div className="w-16 h-16 border border-teal-400 flex items-center justify-center">
            <div className="w-12 h-12 bg-teal-400/10 flex items-center justify-center">
              <span className="text-teal-400 text-2xl">&lt;/&gt;</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-10">
            <NavLink id="01. About" active={activeLink} setActive={setActiveLink} />
            <NavLink id="02. Experience" active={activeLink} setActive={setActiveLink} />
            <NavLink id="03. Projects" active={activeLink} setActive={setActiveLink} />
            <NavLink id="04. Contact" active={activeLink} setActive={setActiveLink} />
          </nav>
          
          <button className="border border-teal-400 text-teal-400 py-2 px-6 rounded hover:bg-teal-400/10 transition">
            Resume
          </button>
        </div>

        {/* Main Content */}
        <div className='flex items-center justify-between'>
          <div className="max-w-4xl mx-auto mt-32">
            <p className="text-teal-400 mb-4">Hello, my name is</p>
            <h1 className="text-6xl md:text-7xl font-bold text-gray-100 mb-4">Ambitious Concepts.</h1>
            <p className="text-6xl md:text-7xl font-bold text-gray-400 mb-8">I love exploring new things!</p>
            
            <div className="text-gray-400 max-w-2xl mb-12">
              <p className="mb-4">
                I'm a Final Year Computer Science Engineering Student at SVVV, Indore. Primarily interested in Web Development and Data Science.
              </p>
              <p>
                I enjoy learning new skills and implementing them in real life!
              </p>
            </div>
            
            <button className="border border-teal-400 text-teal-400 py-3 px-8 rounded hover:bg-teal-400/10 transition">
              Get In Touch
            </button>
          </div>
          <WordArt />
        </div>

      </main>

      {/* Side Social Links */}
      <div className="fixed left-8 bottom-0 hidden md:block">
        <div className="flex flex-col items-center">
          <SocialIcon icon={<FaGithub />} href="https://github.com/yashitanamdeo" />
          <SocialIcon icon={<FaLinkedin />} href="#" />
          <SocialIcon icon={<FaCube />} href="#" />
          <SocialIcon icon={<FaInstagram />} href="#" />
          <SocialIcon icon={<FaTwitter />} href="#" />
          <div className="h-24 w-px bg-teal-400 mt-6"></div>
        </div>
      </div>
      
      {/* Right Email */}
      <div className="fixed right-8 bottom-0 hidden md:block">
        <div className="flex flex-col items-center">
          <div className="text-teal-400 [writing-mode:vertical-rl] tracking-widest mb-6">
            info@ambitiousconcept.com
          </div>
          <div className="h-24 w-px bg-teal-400"></div>
        </div>
      </div>
    </div>
  );
}

// Navigation Link Component
function NavLink({ id, active, setActive }) {
  const isActive = active === id;
  return (
    <a 
      href={`#${id.split('. ')[1].toLowerCase()}`}
      onClick={() => setActive(id)}
      className={`${isActive ? 'text-teal-400' : 'text-gray-300'} hover:text-teal-400 transition`}
    >
      {id}
    </a>
  );
}

// Social Icon Component
function SocialIcon({ icon, href }) {
  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-400 hover:text-teal-400 text-2xl my-2 transition"
    >
      {icon}
    </a>
  );
}