import React, { useContext, useRef } from 'react'
import Card from '../Components/Card'
import img1 from '../assests/1Authbg1.jpg'
import img2 from '../assests/2image.png'
import img4 from '../assests/4img.jpg'
import img6 from '../assests/6img.jpg'
import img7 from '../assests/7img.jpg'
import img8 from '../assests/authBg.png'
import img10 from '../assests/image7.jpeg'
import { RiImageAddLine } from 'react-icons/ri'
import { userdataContext } from '../Contexts/UserContext'
import { useNavigate } from 'react-router-dom'
import { MdKeyboardBackspace } from 'react-icons/md'

function Customize() {
  const {
    setbackendImage,
    frontendImage, setFrontendImage,
    SelectedImage, SetselectedImage
  } = useContext(userdataContext)

  const navigate = useNavigate()
  const inputImage = useRef()

  const handleImage = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setbackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const avatarImages = [img1, img2, img4, img6, img7, img8, img10]

  return (
    <div className="w-full min-h-screen bg-[#020209] flex justify-center items-center flex-col p-6 relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-[-150px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)' }} />

      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-6 left-6 flex items-center gap-2 text-white/40 hover:text-indigo-400 transition-colors text-sm"
      >
        <MdKeyboardBackspace className="w-5 h-5" />
        <span>Back</span>
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="font-orbitron text-3xl font-bold text-transparent bg-clip-text mb-2"
          style={{ backgroundImage: 'linear-gradient(135deg, #a78bfa, #6366f1, #38bdf8)' }}>
          Choose Your Assistant
        </h1>
        <p className="text-white/30 text-sm tracking-wide">Select an avatar to represent your AI companion</p>
      </div>

      {/* Avatar grid */}
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
        {avatarImages.map((img, i) => (
          <Card key={i} image={img} />
        ))}

        {/* Custom upload card */}
        <div
          onClick={() => { inputImage.current.click(); SetselectedImage('input') }}
          className={`w-[80px] h-[130px] lg:w-[130px] lg:h-[210px] rounded-2xl overflow-hidden cursor-pointer
            flex flex-col items-center justify-center gap-2 border-2 transition-all duration-300
            bg-gradient-to-b from-white/5 to-white/2
            ${SelectedImage === 'input'
              ? 'border-indigo-400 shadow-[0_0_24px_rgba(99,102,241,0.5)]'
              : 'border-white/10 hover:border-indigo-500/50 hover:shadow-[0_0_16px_rgba(99,102,241,0.3)]'
            }`}
        >
          {frontendImage && SelectedImage === 'input'
            ? <img src={frontendImage} alt="custom" className="w-full h-full object-cover" />
            : <>
                <RiImageAddLine className="w-6 h-6 text-indigo-400" />
                <span className="text-white/30 text-[10px] text-center px-2 leading-tight">Upload custom</span>
              </>
          }
        </div>

        <input type="file" accept="image/*" ref={inputImage} hidden onChange={handleImage} />
      </div>

      {/* Next button */}
      {SelectedImage && (
        <button
          onClick={() => navigate('/customize2')}
          className="mt-8 px-10 py-3 rounded-full font-semibold text-sm tracking-wide transition-all duration-300
            text-white bg-gradient-to-r from-indigo-600 to-purple-600
            hover:from-indigo-500 hover:to-purple-500
            shadow-[0_0_24px_rgba(99,102,241,0.4)] hover:shadow-[0_0_36px_rgba(99,102,241,0.6)]
            active:scale-95"
          style={{ animation: 'fadeSlideIn 0.4s ease-out' }}
        >
          Next →
        </button>
      )}
    </div>
  )
}

export default Customize