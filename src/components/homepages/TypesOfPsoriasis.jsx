import "../../styles/typesofpsoriasis.css";
import { Carousel } from "antd";

import Erythrodermic from "../../assets/typesofpsoriasis/Erythrodermic.png";
import Guttate from "../../assets/typesofpsoriasis/Guttate.png";
import Inverse from "../../assets/typesofpsoriasis/Inverse.png";
import Nail from "../../assets/typesofpsoriasis/Nail.png";
import Plaque from "../../assets/typesofpsoriasis/Plaque.png";
import Pustular from "../../assets/typesofpsoriasis/Pustular.png";
import Scalp from "../../assets/typesofpsoriasis/Scalp.png";

const TypesOfPsoriasis = () => {
  const carousel1 = [
    {
      image: Plaque,
      title: "Plaque Psoriasis",
      bullet1: [
        "Most common form of psoriasis.",
        "Causes dry, raised, red skin lesions covered with silvery scales.",
      ],
    },
    {
      image: Guttate,
      title: "Guttate Psoriasis",
      bullet1: [
        "More common in children and young adults.",
        "Usually triggered by a bacterial infection.",
        "Marked by small, reddish sores, mainly on the trunk, arms and legs.",
      ],
    },
    {
      image: Inverse,
      title: "Inverse Psoriasis",
      bullet1: [
        "Causes smooth patches of red, inflamed skin primarily in the armpits, groin, under the breast and around genitals.",
      ],
    },
    {
      image: Pustular,
      title: "Pustular Psoriasis",
      bullet1: [
        "Occurs in widespread patches or in smaller areas.",
        "Develops quickly with pus-filled blisters hours after the skin becomes red and tender.",
      ],
    },
    {
      image: Erythrodermic,
      title: "Erythrodermic Psoriasis",
      bullet1: [
        "Very rare.",
        "Covers the entire body with red,  peeling rash that can itch or burn intensely.",
        "Can be triggered by corticosteroids and other medications, sunburn or other types of psoriasis.",
      ],
    },
    {
      image: Scalp,
      title: "Scalp Psoriasis",
      bullet1: [
        "Appears as red, itchy areas with silvery-white scales.",
        "Scaly patches may bleed when removed and extends up to the hairline.",
      ],
    },
    {
      image: Nail,
      title: "Nail Psoriasis",
      bullet1: [
        "Nail psoriasis causes pitting, abnormal nail growth and discoloration.",
        "Nails may become loose and separate from the nail beds.",
      ],
    },
  ];

  return (
    <div className="typesofpsoriasis-container">
      <div className="typesofpsoriasis-content">
        <div className="typesofpsoriasis-header">
          <h1>Types of Psoriasis</h1>
        </div>
        <div className="typesofpsoriasis-carousel">
          <Carousel arrows infinite autoplay autoplaySpeed={5000}>
            {carousel1.map((item, index) => (
              <div key={index} className="carousel-slide">
                <div className="carousel-card">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="carousel-image"
                  />
                  <div className="carousel-caption">
                    <h2>{item.title}</h2>
                    <ul>
                      {item.bullet1.map((bullet, bulletIndex) => (
                        <li key={bulletIndex}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default TypesOfPsoriasis;
