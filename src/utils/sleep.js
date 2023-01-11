function randomRange(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export default function sleep(ms, isRandom = false) {
  // 100ms上下浮动，防止被检测
  const finalTime = isRandom ? ms + randomRange(-100, 100) : ms;

  return new Promise(resolve => {
    setTimeout(resolve, finalTime);
  });
}
