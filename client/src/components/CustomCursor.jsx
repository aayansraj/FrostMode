import React, { useEffect, useState, useRef } from "react";

export const CustomCursor = () => {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [trailingPos, setTrailingPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [particles, setParticles] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  const requestRef = useRef();

  useEffect(() => {
    // Check if device is mobile / touch screen
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsMobile(true);
      return;
    }

    const handleMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;
      setPos({ x, y });

      // Add ice sparkle particle on movement randomly
      if (Math.random() < 0.25) {
        setParticles((prev) => [
          ...prev.slice(-15),
          {
            id: Date.now() + Math.random(),
            x: x + (Math.random() * 12 - 6),
            y: y + (Math.random() * 12 - 6),
            size: Math.random() * 3 + 1.5,
            opacity: 1,
            rotation: Math.random() * 360
          }
        ]);
      }
    };

    const handleMouseDown = () => setIsClicked(true);
    const handleMouseUp = () => setIsClicked(false);

    const handleMouseOver = (e) => {
      const target = e.target;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.tagName === "INPUT" ||
        target.tagName === "SELECT" ||
        target.closest("button") ||
        target.closest("a") ||
        target.getAttribute("role") === "button"
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Smooth lerp trailing animation loop
  useEffect(() => {
    if (isMobile) return;

    const updateTrailingPos = () => {
      setTrailingPos((prev) => {
        const dx = pos.x - prev.x;
        const dy = pos.y - prev.y;
        return {
          x: prev.x + dx * 0.22,
          y: prev.y + dy * 0.22
        };
      });
      requestRef.current = requestAnimationFrame(updateTrailingPos);
    };

    requestRef.current = requestAnimationFrame(updateTrailingPos);
    return () => cancelAnimationFrame(requestRef.current);
  }, [pos, isMobile]);

  // Particle fadeout ticker
  useEffect(() => {
    if (particles.length === 0) return;
    const timer = setTimeout(() => {
      setParticles((prev) =>
        prev
          .map((p) => ({ ...p, opacity: p.opacity - 0.08, y: p.y - 0.8 }))
          .filter((p) => p.opacity > 0)
      );
    }, 30);
    return () => clearTimeout(timer);
  }, [particles]);

  if (isMobile) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Ice Sparkle Trail */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-cyan-300"
          style={{
            left: `${p.x}px`,
            top: `${p.y}px`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            boxShadow: "0 0 8px #38bdf8",
            transform: `rotate(${p.rotation}deg)`,
            transition: "opacity 0.03s linear"
          }}
        />
      ))}

      {/* Outer Ice Ring */}
      <div
        className={`absolute rounded-full border border-sky-400/70 transition-transform duration-100 ease-out backdrop-blur-[1px] ${
          isHovered
            ? "w-10 h-10 -ml-5 -mt-5 bg-sky-500/20 border-cyan-300 shadow-[0_0_20px_rgba(56,189,248,0.7)] scale-125"
            : isClicked
            ? "w-6 h-6 -ml-3 -mt-3 border-cyan-400 scale-75 shadow-[0_0_15px_rgba(6,182,212,0.9)]"
            : "w-8 h-8 -ml-4 -mt-4 bg-sky-950/30 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
        }`}
        style={{
          transform: `translate3d(${trailingPos.x}px, ${trailingPos.y}px, 0)`
        }}
      />

      {/* Inner Neon Cyan Dot */}
      <div
        className={`absolute rounded-full bg-white transition-all duration-75 ${
          isHovered
            ? "w-2.5 h-2.5 -ml-[5px] -mt-[5px] bg-cyan-300 shadow-[0_0_10px_#00f2ff]"
            : "w-2 h-2 -ml-1 -mt-1 bg-sky-300 shadow-[0_0_6px_#38bdf8]"
        }`}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`
        }}
      />
    </div>
  );
};
