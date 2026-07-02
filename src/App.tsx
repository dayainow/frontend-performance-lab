import { useMemo, useState } from "react";
import { CodeSplittingLab } from "./scenarios/code-splitting/CodeSplittingLab";
import { ImageLoadingLab } from "./scenarios/images/ImageLoadingLab";
import { RenderingLab } from "./scenarios/rendering/RenderingLab";
import { StatePropagationLab } from "./scenarios/state/StatePropagationLab";

type ScenarioKey = "rendering" | "images" | "code" | "state";

const scenarios: Array<{
  key: ScenarioKey;
  title: string;
  description: string;
}> = [
  {
    key: "rendering",
    title: "리렌더링",
    description: "memo, useMemo, useCallback이 실제로 줄이는 일을 관찰합니다.",
  },
  {
    key: "images",
    title: "이미지 로딩",
    description: "eager, native lazy, Intersection Observer 방식을 비교합니다.",
  },
  {
    key: "code",
    title: "코드 스플리팅",
    description: "무거운 화면을 필요할 때만 로드하는 흐름을 확인합니다.",
  },
  {
    key: "state",
    title: "상태 전파",
    description: "Context 값 설계가 소비자 리렌더링에 주는 영향을 봅니다.",
  },
];

export default function App() {
  const [activeKey, setActiveKey] = useState<ScenarioKey>("rendering");
  const activeScenario = useMemo(
    () => scenarios.find((scenario) => scenario.key === activeKey)!,
    [activeKey],
  );

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Dayainow frontend performance lab</p>
          <h1>실무형 프론트엔드 상황을 직접 재현하고 측정하는 실험실</h1>
          <p className="hero-copy">
            프론트엔드에서 자주 마주치는 성능 이슈를 작은 실험으로 쪼갰습니다.
            먼저 문제가 되는 상태를 만들고, 개선 버전으로 바꾼 뒤 렌더링 횟수,
            로딩 방식, 번들 경계를 확인합니다.
          </p>
        </div>
        <div className="hero-metrics" aria-label="실험 구성 요약">
          <span>
            <strong>4</strong>
            scenarios
          </span>
          <span>
            <strong>Before</strong>
            baseline
          </span>
          <span>
            <strong>After</strong>
            measured fix
          </span>
        </div>
      </section>

      <nav className="scenario-tabs" aria-label="프론트엔드 실험 목록">
        {scenarios.map((scenario) => (
          <button
            type="button"
            key={scenario.key}
            className={scenario.key === activeKey ? "tab active" : "tab"}
            onClick={() => setActiveKey(scenario.key)}
          >
            <span>{scenario.title}</span>
            <small>{scenario.description}</small>
          </button>
        ))}
      </nav>

      <section className="scenario-frame" aria-labelledby="scenario-title">
        <div className="scenario-heading">
          <p className="eyebrow">Current scenario</p>
          <h2 id="scenario-title">{activeScenario.title}</h2>
          <p>{activeScenario.description}</p>
        </div>

        {activeKey === "rendering" && <RenderingLab />}
        {activeKey === "images" && <ImageLoadingLab />}
        {activeKey === "code" && <CodeSplittingLab />}
        {activeKey === "state" && <StatePropagationLab />}
      </section>
    </main>
  );
}
