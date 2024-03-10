import React from "react";
const useMousePosition = () => {
  const [mousePosition, setMousePosition] = React.useState({
    x: 0,
    y: 0,
  });

  const [clientPosition, setClientPosition] = React.useState({
    x: 0,
    y: 0,
  });

  React.useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setClientPosition({ x: ev.clientX, y: ev.clientY });
      updateScroll();
    };

    const updateScroll = () => {
      setMousePosition({
        x: clientPosition.x + scrollX,
        y: clientPosition.y + window.scrollY,
      });
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("scroll", updateScroll);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.removeEventListener("scroll", updateScroll);
    };
  });
  return mousePosition;
};

const useClientMousePosition = () => {
  const [clientPosition, setClientPosition] = React.useState({
    x: 0,
    y: 0,
  });

  React.useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      setClientPosition({ x: ev.clientX, y: ev.clientY });
    };
    const updateScroll = () => {
      setClientPosition({
        x: clientPosition.x,
        y: clientPosition.y,
      });
    };

    window.addEventListener("mousemove", updateMousePosition);
    window.addEventListener("scroll", updateScroll);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      window.addEventListener("scroll", updateScroll);
    };
  });
  return clientPosition;
};
export { useClientMousePosition };
export default useMousePosition;
