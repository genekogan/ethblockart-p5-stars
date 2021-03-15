import React, { useRef } from 'react';
import Sketch from 'react-p5';
import MersenneTwister from 'mersenne-twister';

let DEFAULT_SIZE = 500;
const CustomStyle = ({
  block,
  canvasRef,
  attributesRef,
  width,
  height,
  handleResize,
  thickness = 0.75,
  opacity = 0.25,
  fill_color = '#000000',
  background = '#ffffff',
}) => {
  const shuffleBag = useRef();
  const hoistedValue = useRef();

  const { hash } = block;

  // setup() initializes p5 and the canvas element, can be mostly ignored in our case (check draw())
  const setup = (p5, canvasParentRef) => {
    // Keep reference of canvas element for snapshots
    let _p5 = p5.createCanvas(width, height).parent(canvasParentRef);
    canvasRef.current = p5;

    attributesRef.current = () => {
      return {
        // This is called when the final image is generated, when creator opens the Mint NFT modal.
        // should return an object structured following opensea/enjin metadata spec for attributes/properties
        // https://docs.opensea.io/docs/metadata-standards
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1155.md#erc-1155-metadata-uri-json-schema

        attributes: [
          {
            display_type: 'number',
            trait_type: 'your trait here number',
            value: hoistedValue.current, // using the hoisted value from within the draw() method, stored in the ref.
          },

          {
            trait_type: 'your trait here text',
            value: 'replace me',
          },
        ],
      };
    };
  };

  const draw = (p5) => {
    let WIDTH = width;
    let HEIGHT = height;
    let DIM = Math.min(WIDTH, HEIGHT);
    let M = DIM / DEFAULT_SIZE;

    p5.background(background);

    // reset shuffle bag
    let seed = parseInt(hash.slice(0, 16), 16);
    shuffleBag.current = new MersenneTwister(seed);
    
    // example assignment of hoisted value to be used as NFT attribute later
    hoistedValue.current = 42;

    // create star
    let n, s, p;
    n = 10 + 14 * parseInt(shuffleBag.current.random());
    do {
      s = [ 
        1 + (n-1) * parseInt(shuffleBag.current.random()),
        1 + (n-1) * parseInt(shuffleBag.current.random()), 
        1 + (n-1) * parseInt(shuffleBag.current.random())
      ];
    } 
    while (n % s[2] === 0);

    p = [];
    for (var i = 0; i < n; i++) {
      var ang = p5.lerp(0, p5.TWO_PI, i / n);
      p.push({x: 0.4 * width * p5.cos(ang), y: 0.4 * height * p5.sin(ang)});
    }  
    
    var col1 = p5.color(fill_color);
    var col2 = p5.color(fill_color);
    col1.setAlpha(75 * opacity);
    col2.setAlpha(120 * opacity);

    p5.push();
    p5.background(background);   
    p5.fill(col1);
    p5.stroke(col2);
    p5.strokeWeight(5.0 * thickness);
    
    p5.translate(WIDTH/2, HEIGHT/2);
    var i1 = 0;
    do {
      var i2 = (i1 + s[0]) % n;
      var i3 = (i1 + s[1]) % n;
      var i4 = (i1 + s[2]) % n;
      p5.beginShape();
        p5.curveVertex(p[i1].x, p[i1].y);
        p5.curveVertex(p[i2].x, p[i2].y);
        p5.curveVertex(p[i3].x, p[i3].y);
        p5.curveVertex(p[i4].x, p[i4].y);
      p5.endShape(p5.CLOSE);
      p5.bezier(p[i1].x, p[i1].y, p[i2].x, p[i2].y, p[i3].x, p[i3].y, p[i4].x, p[i4].y);
      i1 = i3;
    } 
    while (i1 !== 0); 
    p5.pop();
  };

  return <Sketch setup={setup} draw={draw} windowResized={handleResize} />;
};

export default CustomStyle;

const styleMetadata = {
  name: 'Stars',
  description: 'Generate a random n-pointed star',
  image: '',
  creator_name: 'Gene Kogan',
  options: {
    thickness: 0.4,
    opacity: 0.1,
    fill_color: '#000000',
    background: '#ffffff',
  },
};

export { styleMetadata };
