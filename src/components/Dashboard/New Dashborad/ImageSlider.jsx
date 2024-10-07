import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import React from 'react';
import Slider from 'react-slick';
// Replace with the path to your CSS file

const ImageSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    autoplay: false,
    autoplaySpeed: 3000,
  };

  const slides = [
    { img: '/house2.jpg', text: 'First Slide' },
    { img: '/house2.jpg', text: 'Second Slide' },
    { img: '/house2.jpg', text: 'Third Slide' },
  ];

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div key={index} className="slider-item">
            <img
              src={slide.img}
              alt={`Slide ${index + 1}`}
              className="slider-image"
            />
            <div className="text-overlay">{slide.text}</div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ImageSlider;
