import * as THREE from "three";
export function createMountain(container, isPaused) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "low-power",
    });
  } catch {
    return { dispose() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  container.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2("#789084", 0.0085);
  const camera = new THREE.PerspectiveCamera(39, 1, 0.1, 400);
  camera.position.set(4, 25, 66);
  scene.add(new THREE.HemisphereLight("#f4e4cd", "#18382d", 2.3));
  const sun = new THREE.DirectionalLight("#ffcc98", 3.6);
  sun.position.set(-35, 42, -15);
  scene.add(sun);
  const fill = new THREE.DirectionalLight("#9eb9b8", 0.6);
  fill.position.set(20, 15, 25);
  scene.add(fill);
  function hash(x, z) {
    const a = Math.sin(x * 127.1 + z * 311.7) * 43758.5453;
    return a - Math.floor(a);
  }
  function noise(x, z) {
    const ix = Math.floor(x),
      iz = Math.floor(z),
      fx = x - ix,
      fz = z - iz;
    const u = fx * fx * (3 - 2 * fx),
      v = fz * fz * (3 - 2 * fz);
    return (
      (hash(ix, iz) * (1 - u) + hash(ix + 1, iz) * u) * (1 - v) +
      (hash(ix, iz + 1) * (1 - u) + hash(ix + 1, iz + 1) * u) * v
    );
  }
  function fbm(x, z) {
    let v = 0,
      a = 1;
    for (let i = 0; i < 5; i++) {
      v += (noise(x, z) - 0.5) * a;
      x *= 2.13;
      z *= 2.13;
      a *= 0.48;
    }
    return v;
  }
  function elevation(x, z) {
    let h = 0;
    const peaks = [
      [13, -10, 36, 15, 14],
      [-15, -23, 23, 14, 13],
      [37, -24, 28, 17, 17],
      [-36, -31, 19, 16, 15],
      [5, -42, 26, 18, 12],
    ];
    for (const [px, pz, ph, wx, wz] of peaks) {
      const d = Math.sqrt(((x - px) / wx) ** 2 + ((z - pz) / wz) ** 2);
      h = Math.max(h, ph * Math.max(0, 1 - d * 0.58));
    }
    return (
      h +
      fbm(x * 0.19, z * 0.19) * Math.max(1.2, h * 0.28) +
      fbm(x * 0.65, z * 0.65) * 1.2
    );
  }
  const geo = new THREE.PlaneGeometry(170, 135, 210, 170);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -10, -24);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    pos.setY(i, elevation(pos.getX(i), pos.getZ(i)) - 10);
  }
  geo.computeVertexNormals();
  const flat = geo.toNonIndexed();
  const colors = [];
  const p = flat.attributes.position;
  const stone = new THREE.Color(),
    low = new THREE.Color("#314e42"),
    high = new THREE.Color("#819183"),
    snow = new THREE.Color("#dce3d3");
  for (let i = 0; i < p.count; i += 3) {
    const h = (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3 + 10;
    const x = p.getX(i),
      z = p.getZ(i);
    const a = new THREE.Vector3().fromBufferAttribute(p, i),
      b = new THREE.Vector3().fromBufferAttribute(p, i + 1),
      c = new THREE.Vector3().fromBufferAttribute(p, i + 2);
    const normal = b.sub(a).cross(c.sub(a)).normalize();
    const snowLine = 21 + fbm(x * 0.12, z * 0.12) * 6;
    stone.copy(low).lerp(high, Math.min(1, h / 38));
    if (h > snowLine && normal.y > 0.38)
      stone.lerp(snow, Math.min(1, (h - snowLine) / 5) * 0.95);
    stone.multiplyScalar(0.9 + hash(i, 3) * 0.16);
    for (let j = 0; j < 3; j++) colors.push(stone.r, stone.g, stone.b);
  }
  flat.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  const terrain = new THREE.Mesh(
    flat,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 1,
      flatShading: true,
    }),
  );
  scene.add(terrain);
  // A fine trail follows the near ridge, catching the last light.
  const points = [];
  for (let i = 0; i <= 70; i++) {
    const t = i / 70;
    const x = 13 + Math.sin(t * 7) * 2.4 + t * 11;
    const z = -10 + t * 37;
    points.push(new THREE.Vector3(x, elevation(x, z) - 9.7, z));
  }
  const trail = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineDashedMaterial({
      color: "#e6b477",
      dashSize: 0.22,
      gapSize: 0.32,
      transparent: true,
      opacity: 0.62,
    }),
  );
  trail.computeLineDistances();
  scene.add(trail);
  const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    new THREE.MeshBasicMaterial({ color: "#ffdaa4" }),
  );
  marker.position.copy(points[1]);
  scene.add(marker);
  let width = 0,
    height = 0,
    visible = true,
    frame = 0,
    mouseX = 0,
    mouseY = 0;
  const target = new THREE.Vector3(5, 10, -9);
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.fov = width < 700 ? 49 : 39;
    camera.updateProjectionMatrix();
    camera.position.x = width < 700 ? 14 : 4;
    render(0);
  }
  function render(t) {
    if (!visible) return;
    if (!isPaused()) {
      camera.position.x +=
        ((width < 700 ? 14 : 4) + mouseX * 2 - camera.position.x) * 0.025;
      camera.position.y += (25 + mouseY * 0.8 - camera.position.y) * 0.025;
    }
    camera.lookAt(target);
    renderer.render(scene, camera);
  }
  let last = 0,
    wasPaused = false;
  function animate(t) {
    frame = requestAnimationFrame(animate);
    const paused = isPaused();
    if (t - last < 33 || document.hidden || (paused && wasPaused)) return;
    last = t;
    wasPaused = paused;
    render(t);
  }
  const observer = new IntersectionObserver(
    (e) => (visible = e[0].isIntersecting),
  );
  observer.observe(container);
  const move = (e) => {
    mouseX = e.clientX / window.innerWidth - 0.5;
    mouseY = e.clientY / window.innerHeight - 0.5;
  };
  window.addEventListener("pointermove", move, { passive: true });
  window.addEventListener("resize", resize);
  resize();
  animate(0);
  container.classList.add("ready");
  container.closest(".hero").classList.add("has-terrain");
  renderer.domElement.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    container.classList.remove("ready");
    container.closest(".hero").classList.remove("has-terrain");
    cancelAnimationFrame(frame);
  });
  return {
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("pointermove", move);
      window.removeEventListener("resize", resize);
      renderer.dispose();
    },
  };
}
