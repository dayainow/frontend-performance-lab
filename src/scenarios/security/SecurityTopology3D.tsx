import { useEffect, useRef } from "react";
import {
  AmbientLight,
  BufferGeometry,
  Color,
  DirectionalLight,
  Group,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  Vector3,
  WebGLRenderer,
} from "three";

const topologyNodes = [
  { label: "SOC", x: 0, y: 0.05, z: 0, size: 0.23, tier: "core" },
  { label: "EDR", x: -1.35, y: 0.58, z: -0.34, size: 0.15, tier: "sensor" },
  { label: "FW", x: 1.35, y: 0.48, z: -0.38, size: 0.15, tier: "sensor" },
  { label: "IAM", x: -0.9, y: -0.74, z: 0.46, size: 0.14, tier: "identity" },
  { label: "Cloud", x: 0.95, y: -0.72, z: 0.38, size: 0.16, tier: "cloud" },
  { label: "NDR", x: 0.08, y: 0.92, z: 0.58, size: 0.13, tier: "sensor" },
  { label: "DB", x: 0.1, y: -1.02, z: -0.72, size: 0.13, tier: "asset" },
];

type SecurityTopology3DProps = {
  riskLevel: number;
};

export default function SecurityTopology3D({ riskLevel }: SecurityTopology3DProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const scene = new Scene();
    scene.background = new Color("#f8fafc");

    const camera = new PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.15, 4.6);

    const renderer = new WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const ambientLight = new AmbientLight("#ffffff", 1.6);
    const directionalLight = new DirectionalLight("#ffffff", 2.2);
    directionalLight.position.set(2.4, 3.2, 3.6);
    scene.add(ambientLight, directionalLight);

    const group = new Group();
    scene.add(group);

    const corePosition = new Vector3(0, 0.05, 0);
    const nodeMeshes: Mesh[] = [];
    const riskColor = riskLevel > 72 ? "#dc2626" : riskLevel > 58 ? "#f97316" : "#0f766e";

    topologyNodes.forEach((node) => {
      const material = new MeshStandardMaterial({
        color: node.tier === "core" ? riskColor : nodeColor(node.tier),
        emissive: node.tier === "core" ? riskColor : "#000000",
        emissiveIntensity: node.tier === "core" ? 0.18 : 0,
        roughness: 0.44,
        metalness: 0.18,
      });
      const mesh = new Mesh(new SphereGeometry(node.size, 32, 18), material);
      mesh.position.set(node.x, node.y, node.z);
      group.add(mesh);
      nodeMeshes.push(mesh);

      if (node.tier !== "core") {
        const geometry = new BufferGeometry().setFromPoints([
          corePosition,
          new Vector3(node.x, node.y, node.z),
        ]);
        const line = new Line(
          geometry,
          new LineBasicMaterial({
            color: riskLevel > 72 ? "#fca5a5" : "#9fb3be",
            transparent: true,
            opacity: 0.74,
          }),
        );
        group.add(line);
      }
    });

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let animationFrame = 0;
    const animate = () => {
      group.rotation.y += 0.006;
      group.rotation.x = Math.sin(Date.now() / 2200) * 0.07;

      nodeMeshes.forEach((mesh, index) => {
        const pulse = Math.sin(Date.now() / 360 + index) * 0.025;
        mesh.scale.setScalar(1 + pulse);
      });

      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      renderer.dispose();
      nodeMeshes.forEach((mesh) => {
        mesh.geometry.dispose();
        const material = mesh.material;

        if (Array.isArray(material)) {
          material.forEach((item) => item.dispose());
        } else {
          material.dispose();
        }
      });
      container.removeChild(renderer.domElement);
    };
  }, [riskLevel]);

  return (
    <div className="topology-scene">
      <div ref={containerRef} className="topology-canvas" aria-hidden="true" />
      <div className="topology-legend" aria-label="3D 보안 토폴로지 노드">
        {topologyNodes.map((node) => (
          <span key={node.label}>{node.label}</span>
        ))}
      </div>
    </div>
  );
}

function nodeColor(tier: string) {
  return {
    sensor: "#2563eb",
    identity: "#7c3aed",
    cloud: "#0f766e",
    asset: "#475569",
  }[tier];
}
