import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

function isWebGLSupported(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch {
    return false;
  }
}

export const HeroBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!isWebGLSupported()) {
      setWebglFailed(true);
      return;
    }

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Setup scene, camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 32;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: 'default',
        failIfMajorPerformanceCaveat: false
      });
    } catch {
      setWebglFailed(true);
      return; // Graceful fallback if WebGL fails
    }

    if (!renderer || !renderer.domElement) {
      setWebglFailed(true);
      return;
    }

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    containerRef.current.appendChild(renderer.domElement);

    let animationFrameId: number;

    // Context loss handler
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setWebglFailed(true);
    };

    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);

    // Group for objects
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Geometry 1: Abstract Icosahedron Wireframe Core
    const geoIcosa = new THREE.IcosahedronGeometry(12, 2);
    const matIcosa = new THREE.MeshBasicMaterial({
      color: 0x6366f1, // Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });
    const cosaMesh = new THREE.Mesh(geoIcosa, matIcosa);
    mainGroup.add(cosaMesh);

    // Geometry 2: Outer Torus Knot
    const geoTorus = new THREE.TorusKnotGeometry(16, 0.4, 120, 16);
    const matTorus = new THREE.MeshBasicMaterial({
      color: 0x4f46e5, // Darker Indigo
      wireframe: true,
      transparent: true,
      opacity: 0.12
    });
    const torusMesh = new THREE.Mesh(geoTorus, matTorus);
    mainGroup.add(torusMesh);

    // Geometry 3: Floating Particle Constellation
    const particleCount = prefersReducedMotion ? 80 : 200;
    const particleGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      posArray[i] = (Math.random() - 0.5) * 80;
      posArray[i + 1] = (Math.random() - 0.5) * 80;
      posArray[i + 2] = (Math.random() - 0.5) * 60;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Custom particle canvas texture
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
      grad.addColorStop(0, 'rgba(99, 102, 241, 1)');
      grad.addColorStop(0.5, 'rgba(79, 70, 229, 0.5)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 16, 16);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const particleMat = new THREE.PointsMaterial({
      size: 0.8,
      map: particleTexture,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    mainGroup.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      if (!renderer) return;
      try {
        const gl = renderer.getContext();
        if (gl && gl.isContextLost && gl.isContextLost()) {
          setWebglFailed(true);
          return;
        }
      } catch {
        // context error
      }

      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        cosaMesh.rotation.x = elapsedTime * 0.05;
        cosaMesh.rotation.y = elapsedTime * 0.08;

        torusMesh.rotation.x = -elapsedTime * 0.04;
        torusMesh.rotation.z = elapsedTime * 0.03;

        particles.rotation.y = elapsedTime * 0.02;

        targetX += (mouseX * 4 - targetX) * 0.05;
        targetY += (mouseY * 4 - targetY) * 0.05;

        mainGroup.rotation.y = targetX * 0.15;
        mainGroup.rotation.x = -targetY * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Clean up
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (renderer) {
        if (renderer.domElement) {
          renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
          if (containerRef.current && containerRef.current.contains(renderer.domElement)) {
            containerRef.current.removeChild(renderer.domElement);
          }
        }
        renderer.dispose();
      }

      geoIcosa.dispose();
      matIcosa.dispose();
      geoTorus.dispose();
      matTorus.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      particleTexture.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {webglFailed && (
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:24px_24px]" />
      )}
    </div>
  );
};
