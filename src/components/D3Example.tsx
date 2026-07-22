import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

export default function D3Example() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    // 실무형 데이터: 분기별 매출 (단위: 백만 달러)
    const data = [
      { quarter: 'Q1', value: 45 },
      { quarter: 'Q2', value: 80 },
      { quarter: 'Q3', value: 65 },
      { quarter: 'Q4', value: 110 },
      { quarter: 'Q1(Next)', value: 90 },
    ];
    
    // 차트 크기 및 여백 설정 (축이 들어갈 공간 확보)
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = 600;
    const height = 350;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // 초기화

    // 그룹(g) 요소를 만들고 여백만큼 이동시킵니다.
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // 1. 스케일 설정 (Scale)
    // X축: 카테고리(분기)를 픽셀 단위로 맵핑하는 Band Scale
    const xScale = d3.scaleBand()
      .domain(data.map(d => d.quarter))
      .range([0, innerWidth])
      .padding(0.3); // 막대 사이 간격

    // Y축: 0부터 최대값까지를 픽셀 단위로 맵핑하는 Linear Scale
    const maxVal = d3.max(data, d => d.value) || 0;
    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.2]) // 최대값보다 살짝 여유를 둠
      .range([innerHeight, 0]); // SVG는 Y축이 아래로 갈수록 커지므로 뒤집어줍니다.

    // 2. 실무 팁: 축(Axis) 그리기
    // 하단 X축 생성
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`) // 바닥으로 이동
      .call(d3.axisBottom(xScale))
      .attr("color", "#94a3b8")
      .style("font-size", "12px")
      .style("font-family", "Inter")
      .select(".domain").attr("stroke", "rgba(255,255,255,0.1)"); // 축 선 색상

    // 좌측 Y축 생성 (그리드 라인 포함)
    g.append("g")
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth) // 화면 오른쪽 끝까지 가로줄을 긋습니다 (그리드 효과)
      )
      .attr("color", "#94a3b8")
      .style("font-size", "12px")
      .style("font-family", "Inter")
      // 그리드 라인 스타일링
      .call(g => g.select(".domain").remove()) // Y축 제일 왼쪽 실선 제거
      .call(g => g.selectAll(".tick line").attr("stroke", "rgba(255,255,255,0.05)"));

    // 3. 막대(Bar) 데이터 바인딩 및 그리기
    g.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.quarter)!)
      .attr("y", innerHeight) // 애니메이션 시작점: 바닥
      .attr("width", xScale.bandwidth())
      .attr("height", 0) // 애니메이션 시작점: 높이 0
      .attr("fill", "url(#d3-gradient)")
      .attr("rx", 4) // 모서리 둥글게
      
      // 마우스 인터랙션
      .on("mouseenter", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("fill", "#c084fc");
          
        // 툴팁 텍스트 표시
        g.append("text")
          .attr("id", "tooltip")
          .attr("x", xScale(d.quarter)! + xScale.bandwidth() / 2)
          .attr("y", yScale(d.value) - 10)
          .attr("text-anchor", "middle")
          .attr("fill", "#f8fafc")
          .style("font-size", "13px")
          .style("font-weight", "600")
          .text(`$${d.value}M`);
      })
      .on("mouseleave", function() {
        d3.select(this)
          .transition()
          .duration(300)
          .attr("fill", "url(#d3-gradient)");
          
        g.select("#tooltip").remove(); // 툴팁 제거
      })
      
      // 나타나는 트랜지션 애니메이션
      .transition()
      .duration(1000)
      .delay((d, i) => i * 150)
      .attr("y", d => yScale(d.value))
      .attr("height", d => innerHeight - yScale(d.value));

    // 4. 프리미엄 그라데이션 정의
    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "d3-gradient")
      .attr("x1", "0%").attr("y1", "0%")
      .attr("x2", "0%").attr("y2", "100%");
    
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#3b82f6");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "rgba(59, 130, 246, 0.2)");

  }, []);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg 
        ref={svgRef} 
        width="100%" 
        height="100%" 
        viewBox="0 0 600 350"
        preserveAspectRatio="xMidYMid meet"
      ></svg>
    </div>
  );
}
