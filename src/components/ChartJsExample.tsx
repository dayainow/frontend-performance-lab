import React, { useRef, useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler
);

// 1. 선 그래프 컴포넌트
export function ChartJsLine() {
  const chartRef = useRef<ChartJS<"line">>(null);
  const [gradient, setGradient] = useState<CanvasGradient | null>(null);

  useEffect(() => {
    const chart = chartRef.current;
    if (chart) {
      const ctx = chart.ctx;
      const grad = ctx.createLinearGradient(0, 0, 0, 400);
      grad.addColorStop(0, 'rgba(59, 130, 246, 0.5)'); 
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.0)'); 
      setGradient(grad);
    }
  }, []);

  const data = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: '방문자 수 (명)',
        data: [1200, 1900, 1500, 2200, 1800, 2800],
        borderColor: '#3b82f6',
        backgroundColor: gradient || 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#0f111a',
        pointBorderColor: '#3b82f6',
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#e2e8f0',
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94a3b8' }
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
    },
    animation: { duration: 1500, easing: 'easeOutQuart' as const }
  };

  return <Line ref={chartRef} data={data} options={options} />;
}

// 2. 실무에서 많이 쓰는 도넛 차트 컴포넌트
export function ChartJsDoughnut() {
  const data = {
    labels: ['데스크탑', '모바일', '태블릿'],
    datasets: [
      {
        data: [55, 35, 10],
        backgroundColor: [
          '#3b82f6', // 파랑
          '#c084fc', // 보라
          '#2dd4bf', // 민트
        ],
        borderWidth: 0, // 깔끔하게 테두리 제거
        hoverOffset: 10, // 마우스 올렸을 때 살짝 튀어나오는 효과
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '75%', // 가운데 구멍 크기 조절 (도넛 두께)
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: '#f8fafc', padding: 20, font: { family: 'Inter' } }
      }
    },
    animation: { animateScale: true, animateRotate: true, duration: 1500 }
  };

  return <Doughnut data={data} options={options} />;
}
