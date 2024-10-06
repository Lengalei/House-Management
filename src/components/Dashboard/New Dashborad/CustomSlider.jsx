import Slider from "react-slick";
import React from "react";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CustomSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
  };

  const slides = [
    {
      id: 1,
      image: "/house1.jpg",
      description: "First Slide Description",
    },
    {
      id: 2,
      image: "/house2.jpg",
      description: "Second Slide Description",
    },
    {
      id: 3,
      image: "/house3.jpg",
      description: "Third Slide Description",
    },
  ];

  return (
    <div className="slider-container">
      <Slider {...settings}>
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="slide"
            style={{
              backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${slide.image})`,
            }}
          >
            <h5>{slide.description}</h5>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default CustomSlider;
