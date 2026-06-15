// Relying on global tsParticles loaded via CDN
export async function initNetworkBg() {
  const container = document.getElementById('hero-canvas-container');
  if (!container) return;

  await tsParticles.load({
    id: "hero-canvas-container",
    options: {
      fullScreen: { enable: false },
      background: {
        color: { value: "transparent" },
      },
      fpsLimit: 60,
      interactivity: {
        events: {
          onHover: {
            enable: true,
            mode: "grab",
          },
          resize: true,
        },
        modes: {
          grab: {
            distance: 200,
            links: {
              opacity: 0.5,
              color: "#006BFF"
            },
          },
        },
      },
      particles: {
        color: {
          value: "#006BFF",
        },
        links: {
          color: "#006BFF",
          distance: 150,
          enable: true,
          opacity: 0.2,
          width: 1,
        },
        move: {
          direction: "none",
          enable: true,
          outModes: {
            default: "bounce",
          },
          random: false,
          speed: 1,
          straight: false,
        },
        number: {
          density: {
            enable: true,
            area: 800,
          },
          value: 60,
        },
        opacity: {
          value: 0.3,
        },
        shape: {
          type: "circle",
        },
        size: {
          value: { min: 1, max: 3 },
        },
      },
      detectRetina: true,
    },
  });
}
