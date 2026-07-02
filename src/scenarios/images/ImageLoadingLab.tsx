import { useEffect, useMemo, useRef, useState } from "react";
import { Metric } from "../../components/Metric";
import { SegmentedControl } from "../../components/SegmentedControl";

type ImageMode = "eager" | "native" | "observer";

type DemoImage = {
  id: number;
  title: string;
  src: string;
};

export function ImageLoadingLab() {
  const [mode, setMode] = useState<ImageMode>("eager");
  const [loadedIds, setLoadedIds] = useState<Set<number>>(() => new Set());
  const images = useMemo(() => buildDemoImages(72), []);
  const loadedCount = loadedIds.size;

  const markLoaded = (id: number) => {
    setLoadedIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  const handleModeChange = (nextMode: ImageMode) => {
    setMode(nextMode);
    setLoadedIds(new Set());
  };

  return (
    <div className="lab-grid">
      <aside className="lab-panel">
        <SegmentedControl
          label="로딩 방식"
          value={mode}
          options={[
            { label: "Eager", value: "eager" },
            { label: "Native", value: "native" },
            { label: "Observer", value: "observer" },
          ]}
          onChange={handleModeChange}
        />

        <div className="metrics-grid">
          <Metric label="Total images" value={images.length} />
          <Metric
            label="Loaded"
            value={loadedCount}
            tone={loadedCount < images.length ? "warn" : "good"}
          />
          <Metric label="Skeletons" value={images.length - loadedCount} />
        </div>

        <div className="note">
          <strong>관찰 포인트</strong>
          <p>
            Observer 모드는 화면 근처에 들어오기 전까지 src를 넣지 않습니다.
            Network 탭에서는 실제 CDN 이미지로 바꾸면 요청 시점 차이를 더
            명확하게 볼 수 있습니다.
          </p>
        </div>
      </aside>

      <div className="image-scroll-area">
        <div className="image-grid">
          {images.map((image) => (
            <ImageCard
              key={`${mode}-${image.id}`}
              image={image}
              mode={mode}
              onLoad={markLoaded}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ImageCard({
  image,
  mode,
  onLoad,
}: {
  image: DemoImage;
  mode: ImageMode;
  onLoad: (id: number) => void;
}) {
  const [visible, setVisible] = useState(mode !== "observer");
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisible(mode !== "observer");
  }, [mode]);

  useEffect(() => {
    if (mode !== "observer" || visible || !shellRef.current) return;
    return observeOnce(shellRef.current, () => setVisible(true));
  }, [mode, visible]);

  return (
    <figure className="image-card" ref={shellRef}>
      <div className="image-box">
        {!visible && <div className="skeleton" aria-hidden="true" />}
        {visible && (
          <img
            src={image.src}
            alt={image.title}
            loading={mode === "native" ? "lazy" : "eager"}
            decoding="async"
            onLoad={() => onLoad(image.id)}
          />
        )}
      </div>
      <figcaption>
        <strong>{image.title}</strong>
        <span>{mode === "observer" ? "Intersection Observer" : mode}</span>
      </figcaption>
    </figure>
  );
}

const observed = new WeakSet<Element>();

function observeOnce(element: Element, callback: () => void) {
  if (observed.has(element)) return undefined;
  observed.add(element);

  if (!("IntersectionObserver" in window)) {
    callback();
    return undefined;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        callback();
        observer.disconnect();
      }
    },
    { rootMargin: "220px" },
  );

  observer.observe(element);
  return () => observer.disconnect();
}

function buildDemoImages(count: number): DemoImage[] {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1;
    return {
      id,
      title: `Product visual ${String(id).padStart(2, "0")}`,
      src: buildSvgImage(id),
    };
  });
}

function buildSvgImage(id: number) {
  const palettes = [
    ["#0f766e", "#f59e0b", "#ffffff"],
    ["#2563eb", "#10b981", "#ffffff"],
    ["#be123c", "#facc15", "#ffffff"],
    ["#334155", "#38bdf8", "#ffffff"],
  ];
  const [base, accent, text] = palettes[id % palettes.length];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420">
      <rect width="640" height="420" fill="${base}"/>
      <circle cx="${110 + (id % 5) * 90}" cy="120" r="96" fill="${accent}" opacity=".92"/>
      <rect x="72" y="244" width="496" height="72" rx="18" fill="${text}" opacity=".92"/>
      <rect x="112" y="338" width="260" height="24" rx="12" fill="${accent}" opacity=".95"/>
      <text x="96" y="292" font-family="Arial, sans-serif" font-size="42" font-weight="700" fill="${base}">
        DAYA ${String(id).padStart(2, "0")}
      </text>
    </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
