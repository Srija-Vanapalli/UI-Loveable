import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface TwinViewerHandle {
  reset: () => void;
}

interface DigitalTwinViewerProps {
  running: boolean;
  temperature: number;
  scenario: "harbour" | "thermal" | "acoustic";
  ref?: Ref<TwinViewerHandle>;
}

/** Interactive sample twin: enclosure, PCB, sensor nodes, and animated acoustic fields. */
export function DigitalTwinViewer({ running, temperature, scenario, ref }: DigitalTwinViewerProps) {
  const mount = useRef<HTMLDivElement>(null);
  const runningRef = useRef(running);
  const temperatureRef = useRef(temperature);
  const scenarioRef = useRef(scenario);
  const resetRef = useRef<() => void>(() => {});

  useImperativeHandle(ref, () => ({ reset: () => resetRef.current() }));
  useEffect(() => {
    runningRef.current = running;
  }, [running]);
  useEffect(() => {
    temperatureRef.current = temperature;
  }, [temperature]);
  useEffect(() => {
    scenarioRef.current = scenario;
  }, [scenario]);

  useEffect(() => {
    const element = mount.current;
    if (!element) return;

    // WebGL needs explicit colors; these mirror the light-theme semantic tokens.
    const palette = {
      primary: new THREE.Color("#1f6fa8"),
      success: new THREE.Color("#1f9d5c"),
      warning: new THREE.Color("#d99a22"),
      destructive: new THREE.Color("#d6453d"),
      foreground: new THREE.Color("#2a2f3a"),
      grid: new THREE.Color("#d8e0e8"),
      gridCenter: new THREE.Color("#9aa3b2"),
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    element.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 200);
    const home = new THREE.Vector3(21, 15, 22);
    camera.position.copy(home);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2.2, 0);
    controls.minDistance = 16;
    controls.maxDistance = 52;

    const grid = new THREE.GridHelper(42, 42, palette.gridCenter, palette.grid);
    scene.add(grid);
    scene.add(new THREE.AmbientLight(0xffffff, 1.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.6);
    keyLight.position.set(8, 18, 12);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-12, 8, -8);
    scene.add(rimLight);

    const makePart = (
      width: number,
      height: number,
      depth: number,
      color: THREE.Color,
      opacity: number,
    ) => {
      const group = new THREE.Group();
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({
        color: color.clone(),
        transparent: true,
        opacity,
        roughness: 0.55,
        metalness: 0.08,
      });
      group.add(new THREE.Mesh(geometry, material));
      group.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geometry),
          new THREE.LineBasicMaterial({ color: color.clone(), transparent: true, opacity: 0.8 }),
        ),
      );
      return group;
    };

    const shell = makePart(14.2, 4.6, 9.6, palette.primary, 0.16);
    shell.position.y = 2.5;
    scene.add(shell);
    const shellMaterial = (shell.children[0] as THREE.Mesh).material as THREE.MeshStandardMaterial;

    const base = makePart(14.4, 0.35, 9.8, palette.foreground, 0.5);
    base.position.y = 0.18;
    scene.add(base);
    const pcb = makePart(8.8, 0.18, 6, palette.success, 0.78);
    pcb.position.y = 1;
    scene.add(pcb);
    const processor = makePart(1.8, 0.45, 1.8, palette.foreground, 0.92);
    processor.position.set(-0.8, 1.3, 0);
    scene.add(processor);
    const radio = makePart(1.4, 0.35, 2.4, palette.primary, 0.82);
    radio.position.set(2.2, 1.25, 0.6);
    scene.add(radio);
    const battery = makePart(3.4, 1.25, 2.3, palette.foreground, 0.68);
    battery.position.set(-3.6, 1.65, -1.5);
    scene.add(battery);

    const sensorMaterial = new THREE.MeshStandardMaterial({
      color: palette.success,
      emissive: palette.success,
      emissiveIntensity: 0.5,
    });
    const sensorPositions = [
      [4.8, 2.2, 2.7],
      [-4.8, 2.2, 2.7],
      [4.8, 2.2, -2.7],
    ] as const;
    sensorPositions.forEach(([x, y, z]) => {
      const sensor = new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), sensorMaterial.clone());
      sensor.position.set(x, y, z);
      scene.add(sensor);
      const stem = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 1.4, 8),
        new THREE.MeshBasicMaterial({ color: palette.primary }),
      );
      stem.position.set(x, y - 0.75, z);
      scene.add(stem);
    });

    const pulseGroup = new THREE.Group();
    pulseGroup.position.set(4.8, 2.25, 2.7);
    scene.add(pulseGroup);
    const pulses = Array.from({ length: 4 }, (_, index) => {
      const material = new THREE.MeshBasicMaterial({
        color: palette.primary,
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(new THREE.RingGeometry(0.94, 1, 64), material);
      ring.rotation.x = -Math.PI / 2;
      ring.userData["offset"] = index / 4;
      pulseGroup.add(ring);
      return ring;
    });

    const antenna = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 3.4, 10),
      new THREE.MeshStandardMaterial({ color: palette.foreground }),
    );
    antenna.position.set(2.2, 3.5, 0.6);
    scene.add(antenna);
    const antennaTip = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 16, 16),
      sensorMaterial.clone(),
    );
    antennaTip.position.set(2.2, 5.2, 0.6);
    scene.add(antennaTip);

    resetRef.current = () => {
      camera.position.copy(home);
      controls.target.set(0, 2.2, 0);
      controls.update();
    };

    const resize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    const clock = new THREE.Clock();
    let elapsed = 0;
    let frame = 0;
    const tick = () => {
      const delta = Math.min(clock.getDelta(), 0.05);
      if (runningRef.current) elapsed += delta;
      const activeScenario = scenarioRef.current;
      const heat = THREE.MathUtils.clamp((temperatureRef.current - 20) / 45, 0, 1);
      shellMaterial.color
        .copy(palette.primary)
        .lerp(activeScenario === "thermal" ? palette.destructive : palette.warning, heat * 0.75);
      controls.autoRotate = runningRef.current;
      controls.autoRotateSpeed = 0.35;

      pulses.forEach((ring) => {
        const speed = activeScenario === "acoustic" ? 0.75 : 0.38;
        const phase = (elapsed * speed + ring.userData["offset"]) % 1;
        const scale = 0.6 + phase * (activeScenario === "acoustic" ? 8 : 5);
        ring.scale.setScalar(scale);
        const material = ring.material as THREE.MeshBasicMaterial;
        material.opacity = runningRef.current ? (1 - phase) * 0.42 : 0.08;
        material.color.copy(activeScenario === "thermal" ? palette.warning : palette.primary);
      });
      antennaTip.rotation.y += delta;
      controls.update();
      renderer.render(scene, camera);
      element.dataset["sceneReady"] = "true";
      frame = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) {
          object.geometry.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={mount}
      className="h-full w-full cursor-grab active:cursor-grabbing"
      aria-label="Interactive 3D digital twin of the harbour-listener sample device"
    />
  );
}
