import Jimp from 'jimp';
import { RenderImageSpecs, RenderPoint } from '../../types';

export const scaleImage = (image: Jimp, specs: RenderImageSpecs): RenderPoint => {
  const { scale, anchor } = specs;
  const w = image.getWidth();
  const h = image.getHeight();

  const cx = anchor.x;
  const cy = anchor.y;

  const deltaX = cx - cx * scale.x;
  const deltaY = cy - cy * scale.y;

  image.scaleToFit(w * scale.x, h * scale.y);

  return {
    x: deltaX,
    y: deltaY,
  };
};

export const rotateImage = (parent: Jimp, childImage: Jimp, specs: RenderImageSpecs, scaleShift: RenderPoint) => {
  const { rotation, anchor, opacity, offset, scale } = specs;
  const ax = anchor.x * scale.x;
  const ay = anchor.y * scale.y;

  const radians = (rotation * Math.PI) / 180;

  const w = childImage.getWidth();
  const h = childImage.getHeight();

  const s = Math.sin(-radians);
  const c = Math.cos(-radians);
  const newAnchorX = ax * c - ay * s;
  const newAnchorY = ax * s + ay * c;

  const shiftX = Math.sin(radians) * w;
  const shiftY = Math.cos(radians) * h;

  childImage.rotate(rotation);

  let deltaX = 0;
  let deltaY = 0;
  if (Math.abs(rotation) <= 90) {
    if (rotation < 0) {
      deltaX = shiftX;
      deltaY = 0;
    } else {
      deltaX = 0;
      deltaY = -shiftX;
    }
  } else {
    if (rotation < 0) {
      deltaX = shiftX + shiftY;
      deltaY = shiftY;
    } else {
      deltaX = shiftY;
      deltaY = shiftY - shiftX;
    }
  }

  const newX = deltaX + ax - newAnchorX + offset.x + scaleShift.x;
  const newY = deltaY + ay - newAnchorY + offset.y + scaleShift.y;

  parent.composite(childImage, newX, newY, {
    opacityDest: 1,
    opacitySource: opacity,
    mode: '',
  });
};

export const drawPoint = async (background: Jimp, x: number, y: number) => {
  const point = await Jimp.read(50, 50, 0x00ff00ff);
  background.composite(point, x - point.getWidth() / 2, y - point.getHeight() / 2);
};
