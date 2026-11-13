import { useEffect, useImperativeHandle, useRef, type Ref } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export interface ViewerHandle {
  reset: () => void;
}

/** Wireframe CAD-style enclosure: 142 × 96 × 48 mm shell, lid, PCB. Units = cm. */
export function EnclosureViewer({ lidOpen, ref }: { lidOpen: boolean; ref?: Ref<ViewerHandle> }) {
  const mount = useRef<HTMLDivElement>(null);
  const lidRef = useRef<THREE.Group | null>(null);
  const lidTarget = useRef(0);
  const resetRef = useRef<() => void>(() => {});
  useImperativeHandle(ref, () => ({ reset: () => resetRef.current() }));
  useEffect(() => {
    lidTarget.current = lidOpen ? -Math.PI * 0.55 : 0;
  }, [lidOpen]);

  useEffect(() => {
    const el = mount.current!;
    // Scene palette (WebGL can't read oklch CSS tokens).
    const PALETTE: Record<string, string> = {
      "--primary": "#1f6fa8",
      "--success": "#1f9d5c",
      "--foreground": "#2a2f3a",
      "--destructive": "#d6453d",
      "--muted-foreground": "#9aa3b2",
      "--border": "#dde2ea",
    };
    const col = (v: string) => new THREE.Color(PALETTE[v]);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 200);
    const home = new THREE.Vector3(22, 16, 22);
    camera.position.copy(home);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 2, 0);

    const grid = new THREE.GridHelper(40, 40, col("--muted-foreground"), col("--border"));
    scene.add(grid);
    scene.add(new THREE.AmbientLight(0xffffff, 1.4));
    const dl = new THREE.DirectionalLight(0xffffff, 1.2);
    dl.position.set(10, 20, 10);
    scene.add(dl);

    const primary = col("--primary");
    const part = (w: number, h: number, d: number, color: THREE.Color, opacity: number) => {
      const g = new THREE.Group();
      const geo = new THREE.BoxGeometry(w, h, d);
      g.add(
        new THREE.Mesh(
          geo,
          new THREE.MeshStandardMaterial({ color, transparent: true, opacity, roughness: 0.6 }),
        ),
      );
      g.add(
        new THREE.LineSegments(
          new THREE.EdgesGeometry(geo),
          new THREE.LineBasicMaterial({ color }),
        ),
      );
      return g;
    };
    const W = 14.2,
      D = 9.6,
      H = 4.8,
      LID = 0.6;
    const shell = part(W, H - LID, D, primary, 0.12);
    shell.position.y = (H - LID) / 2;
    scene.add(shell);
    const pcb = part(8.8, 0.16, 6, col("--success"), 0.5);
    pcb.position.y = 0.8;
    scene.add(pcb);
    const chip = part(1.6, 0.3, 1.6, col("--foreground"), 0.6);
    chip.position.set(-1, 1.03, 0);
    scene.add(chip);
    const usb = part(0.9, 0.35, 1, col("--destructive"), 0.6);
    usb.position.set(W / 2 - 0.5, 1.2, 0);
    scene.add(usb);
    // Lid hinged at back edge
    const lid = new THREE.Group();
    lid.position.set(0, H - LID, -D / 2);
    const lidMesh = part(W, LID, D, primary, 0.2);
    lidMesh.position.set(0, LID / 2, D / 2);
    lid.add(lidMesh);
    scene.add(lid);
    lidRef.current = lid;

    resetRef.current = () => {
      camera.position.copy(home);
      controls.target.set(0, 2, 0);
      controls.update();
    };

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    let raf = 0;
    const tick = () => {
      lid.rotation.x += (lidTarget.current - lid.rotation.x) * 0.12;
      controls.update();
      renderer.render(scene, camera);
      el.dataset["sceneReady"] = "true";
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      renderer.dispose();
      el.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mount} className="h-full w-full cursor-grab active:cursor-grabbing" />;
}
