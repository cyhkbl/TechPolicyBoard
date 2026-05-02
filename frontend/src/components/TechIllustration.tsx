import robotImg from '../assets/robot.png';
import quantumImg from '../assets/quantum.png';
import fusionImg from '../assets/fusion.png';
import bciImg from '../assets/bci.png';

interface Props { techId: string; hoveredCat: string | null; }

export function getTechBg(_techId: string): string {
  return '#E4E3E0';
}

export function TechIllustration({ techId, hoveredCat: _hoveredCat }: Props) {
  if (techId === 'bci') return (
    <div className="relative h-full w-full">
      <img src={bciImg} alt="脑机接口" className="h-full w-full object-contain" />
    </div>
  );
  if (techId === 'quantum') return (
    <div className="relative h-full w-full">
      <img src={quantumImg} alt="量子计算" className="h-full w-full object-contain" />
    </div>
  );
  if (techId === 'fusion') return (
    <div className="relative h-full w-full">
      <img src={fusionImg} alt="核聚变" className="h-full w-full object-contain" />
    </div>
  );
  return (
    <div className="relative h-full w-full">
      <img src={robotImg} alt="具身智能" className="h-full w-full object-contain" />
    </div>
  );
}
