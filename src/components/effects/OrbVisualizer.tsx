import { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Simple Perlin-like noise function
function noise(x: number, y: number, z: number): number {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const p = perm;
  const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
  const B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
  return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)),
    lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))),
    lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)),
    lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

function fade(t: number): number { return t * t * t * (t * (t * 6 - 15) + 10); }
function lerp(t: number, a: number, b: number): number { return a + t * (b - a); }
function grad(hash: number, x: number, y: number, z: number): number {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

const perm = new Uint8Array(512);
const permBase = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
for (let i = 0; i < 512; i++) perm[i] = permBase[i & 255];

export default function OrbVisualizer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.offsetWidth / container.offsetHeight, 0.1, 100);
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.offsetWidth, container.offsetHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0B0C10, 1);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Core geometry
    const geometry = new THREE.IcosahedronGeometry(1.2, 30);
    const positions = geometry.attributes.position;
    const v3 = new THREE.Vector3();

    // Materials
    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1F2833,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.2,
      transparent: true,
      opacity: 0.9,
    });

    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x2A3A4B,
      wireframe: true,
      transparent: true,
      opacity: 0.1,
    });

    const coreMesh = new THREE.Mesh(geometry, coreMaterial);
    const wireMesh = new THREE.Mesh(geometry, wireMaterial);
    scene.add(coreMesh);
    scene.add(wireMesh);

    // Floating particles
    const particleCount = 800;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.5 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x66FCF1,
      size: 0.03,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeo, particleMaterial);
    scene.add(particles);

    // Ambient lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0x66FCF1, 1, 10);
    pointLight.position.set(3, 3, 3);
    scene.add(pointLight);

    let time = 0;
    let animationId: number;

    function animate() {
      animationId = requestAnimationFrame(animate);
      time += 0.005;

      // Animate vertices with noise
      for (let i = 0; i < positions.count; i++) {
        v3.fromBufferAttribute(positions, i);
        const vertexAngle = v3.angleTo(new THREE.Vector3(0, 1, 0));
        const n = noise(v3.x * 0.5 + time, v3.y * 0.5 + time, v3.z * 0.5);
        const displacement = 1 + Math.sin(vertexAngle * 5 + time) * 0.1 * n;
        v3.multiplyScalar(displacement);
        positions.setXYZ(i, v3.x, v3.y, v3.z);
      }
      positions.needsUpdate = true;
      geometry.computeVertexNormals();

      // Rotate
      coreMesh.rotation.y += 0.002;
      wireMesh.rotation.y += 0.002;
      particles.rotation.y -= 0.0025;

      renderer.render(scene, camera);
    }

    animate();

    // Handle resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.offsetWidth / container.offsetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.offsetWidth, container.offsetHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      geometry.dispose();
      coreMaterial.dispose();
      wireMaterial.dispose();
      particleGeo.dispose();
      particleMaterial.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
      }}
    />
  );
}
