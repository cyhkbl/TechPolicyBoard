import robotImg from '../assets/robot.jpg';

interface Props { techId: string; hoveredCat: string | null; }

export function getTechBg(_techId: string): string {
  return '#E4E3E0';
}

export function TechIllustration({ techId, hoveredCat }: Props) {
  if (techId === 'bci')     return <BCIIllustration hoveredCat={hoveredCat} />;
  if (techId === 'quantum') return <QuantumIllustration hoveredCat={hoveredCat} />;
  if (techId === 'fusion')  return <FusionIllustration hoveredCat={hoveredCat} />;
  return (
    <div className="relative h-full w-full">
      <img src={robotImg} alt="具身智能" className="h-full w-full object-cover object-top" />
    </div>
  );
}

// ── Shared helpers ────────────────────────────────────────────────────────────

const C = { perception: '#0284c7', motion: '#ea580c', cognition: '#7c3aed' };
const DIM = '#c4cdd8';      // inactive stroke on white bg
const DIMFILL = '#f1f3f6';  // inactive fill on white bg

function active(cat: string | null, id: string) { return cat === id; }
function sc(cat: string | null, id: string) { return active(cat, id) ? C[id as keyof typeof C] : DIM; }
function fc(cat: string | null, id: string) { return active(cat, id) ? C[id as keyof typeof C] + '18' : DIMFILL; }

const FILTER_ID = 'teGlow';
const FilterDef = () => (
  <filter id={FILTER_ID} x="-60%" y="-60%" width="220%" height="220%">
    <feGaussianBlur stdDeviation="5" result="b"/>
    <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
);

function Bracket({ x, y, sx, sy }: { x: number; y: number; sx: number; sy: number }) {
  return <path d={`M${x} ${y+sy*16}L${x} ${y}L${x+sx*16} ${y}`}
    fill="none" stroke="#cdd0d8" strokeWidth="1.2"/>;
}

function Anno({ x1,y1,x2,y2,label,sub,right=false }:{x1:number;y1:number;x2:number;y2:number;label:string;sub:string;right?:boolean}) {
  const lx = right ? x2+4 : x2-4;
  return <>
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={DIM} strokeWidth="0.8" strokeDasharray="3,3" opacity="0.5"/>
    <line x1={x2} y1={y2} x2={right?x2+40:x2-40} y2={y2} stroke={DIM} strokeWidth="0.8" opacity="0.5"/>
    <text x={right?x2+4:x2-4} y={y2-4} textAnchor={right?"start":"end"} fontSize="7"
      fontFamily="monospace" letterSpacing="1.2" fill="#8a9ab8" opacity="0.7">{label}</text>
    <text x={right?x2+4:x2-4} y={y2+7} textAnchor={right?"start":"end"} fontSize="6.5"
      fontFamily="monospace" fill="#8a9ab8" opacity="0.55">{sub}</text>
  </>;
}

// ── BCI ── PPT-style flat diagram ─────────────────────────────────────────────

function BCIIllustration({ hoveredCat }: { hoveredCat: string | null }) {
  const aP = active(hoveredCat,'perception');
  const aM = active(hoveredCat,'motion');
  const aC = active(hoveredCat,'cognition');

  // Node configs: type label + color
  const NODES = [
    {ex:136,ey:112,nx:56, ny:68, label:'侵入式', color:'#ef4444'},
    {ex:168,ey: 90,nx:118,ny:34, label:'侵入式', color:'#ef4444'},
    {ex:205,ey: 86,nx:190,ny:28, label:'非侵入式', color:'#22c55e'},
    {ex:238,ey:110,nx:268,ny:40, label:'半侵入式', color:'#f59e0b'},
    {ex:278,ey:152,nx:346,ny:108,label:'半侵入式', color:'#f59e0b'},
    {ex:282,ey:205,nx:350,ny:224,label:'非侵入式', color:'#22c55e'},
    {ex:100,ey:205,nx:30, ny:234,label:'侵入式', color:'#ef4444'},
  ];

  return (
    <svg viewBox="0 0 380 500" className="h-full w-auto" style={{ maxHeight:'100%' }}>
      <defs>
        <FilterDef/>
        <linearGradient id="brainGrad" x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={aP ? '#bfdbfe' : '#dbeafe'}/>
          <stop offset="50%" stopColor={aP ? '#93c5fd' : '#bfdbfe'}/>
          <stop offset="100%" stopColor={aP ? '#60a5fa' : '#93c5fd'}/>
        </linearGradient>
        <linearGradient id="stemGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={aP ? '#60a5fa' : '#93c5fd'}/>
          <stop offset="100%" stopColor={aP ? '#3b82f6' : '#60a5fa'}/>
        </linearGradient>
        <linearGradient id="chipGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={aC ? '#7c3aed' : '#a78bfa'} stopOpacity={aC?'0.25':'0.12'}/>
          <stop offset="100%" stopColor={aC ? '#4f46e5' : '#818cf8'} stopOpacity={aC?'0.15':'0.06'}/>
        </linearGradient>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="50%">
          <stop offset="0%" stopColor="#eff6ff" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#E4E3E0" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Soft background glow */}
      <ellipse cx="190" cy="200" rx="190" ry="200" fill="url(#bgGlow)"/>

      {/* ── Brain (perception) ── */}
      <g filter={aP?`url(#${FILTER_ID})`:undefined}>
        {/* Drop shadow */}
        <path d="M190 78 C230 71,270 85,278 120 C290 135,296 153,288 171 C300 185,298 205,284 217 C282 235,268 251,250 255 C238 271,218 275,200 271 L190 273 L180 271 C162 275,142 271,130 255 C112 251,98 235,96 217 C82 205,80 185,92 171 C84 153,90 135,102 120 C110 85,150 71,190 78Z"
          fill="#bfdbfe" opacity="0.3" transform="translate(3,4)"/>
        {/* Main brain */}
        <path d="M190 75 C230 68,270 82,278 118 C290 132,296 150,288 168 C300 182,298 202,284 214 C282 232,268 248,250 252 C238 268,218 272,200 268 L190 270 L180 268 C162 272,142 268,130 252 C112 248,98 232,96 214 C82 202,80 182,92 168 C84 150,90 132,102 118 C110 82,150 68,190 75Z"
          fill="url(#brainGrad)" stroke={aP?'#3b82f6':'#93c5fd'} strokeWidth={aP?2.2:1.6}/>
        {/* Surface highlight */}
        <path d="M155 90 C165 80,210 76,240 88 C255 95,262 108,258 118 C240 100,210 88,175 90Z"
          fill="white" opacity="0.35"/>
        {/* Fold lines */}
        {[
          "M155 108 Q165 125 158 147 Q152 164 167 176",
          "M190 83 Q192 108 186 128 Q180 146 193 160",
          "M222 106 Q230 126 226 146 Q222 164 234 176",
          "M152 188 Q172 183 190 189 Q208 183 228 188",
        ].map((d,i)=>(
          <path key={i} d={d} fill="none"
            stroke={aP?'#1d4ed8':'#3b82f6'}
            strokeWidth="1.4" opacity={aP?0.45:0.22}/>
        ))}
        {/* Divider */}
        <line x1="190" y1="82" x2="190" y2="265"
          stroke={aP?'#2563eb':'#60a5fa'} strokeWidth="1.2"
          strokeDasharray="5,4" opacity={aP?0.35:0.18}/>
        {/* Brain stem */}
        <path d="M175 265 Q174 292 178 304 Q181 312 190 314 Q199 312 202 304 Q206 292 205 265"
          fill="url(#stemGrad)" stroke={aP?'#3b82f6':'#93c5fd'} strokeWidth="1.4"/>
        <Anno x1={96} y1={172} x2={36} y2={155} label="SENSOR" sub="感知系统"/>
      </g>

      {/* ── Electrode nodes (motion) ── */}
      <g filter={aM?`url(#${FILTER_ID})`:undefined}>
        {NODES.map(({ex,ey,nx,ny,label,color},i)=>{
          const dim = !aM;
          const nc = dim ? '#94a3b8' : color;
          return (
            <g key={i}>
              <line x1={ex} y1={ey} x2={nx} y2={ny}
                stroke={nc} strokeWidth={aM?1.8:1.1} opacity={aM?0.7:0.35}/>
              {/* Node outer ring */}
              <circle cx={nx} cy={ny} r="15"
                fill={dim?'#f1f5f9':color+'25'}
                stroke={nc} strokeWidth={aM?2:1.4}/>
              {/* Node inner fill */}
              <circle cx={nx} cy={ny} r="7"
                fill={dim?'#cbd5e1':color}
                opacity={aM?1:0.5}
                filter={aM?`url(#${FILTER_ID})`:undefined}/>
              {/* Label */}
              <text x={nx} y={ny+26} textAnchor="middle"
                fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="500"
                fill={dim?'#64748b':color} opacity={aM?1:0.55}>{label}</text>
              {/* Surface electrode dot */}
              <circle cx={ex} cy={ey} r="4.5"
                fill={dim?'#94a3b8':color}
                stroke="white" strokeWidth="1.5"
                filter={aM?`url(#${FILTER_ID})`:undefined}/>
            </g>
          );
        })}
        {/* Legend */}
        {[['侵入式','#ef4444'],['半侵入式','#f59e0b'],['非侵入式','#22c55e']].map(([t,c],i)=>(
          <g key={i} transform={`translate(${20+i*112}, 460)`}>
            <circle cx="6" cy="0" r="5" fill={aM?c:'#94a3b8'}/>
            <text x="14" y="4" fontSize="8" fontFamily="system-ui" fill={aM?c:'#94a3b8'}>{t}</text>
          </g>
        ))}
        <Anno x1={268} y1={40} x2={310} y2={24} label="MOTION" sub="运动控制" right/>
      </g>

      {/* ── Decode chip (cognition) ── */}
      <g filter={aC?`url(#${FILTER_ID})`:undefined}>
        <line x1="190" y1="314" x2="190" y2="358"
          stroke={aC?'#7c3aed':'#a78bfa'} strokeWidth={aC?2:1.3}
          strokeDasharray="5,3" opacity={aC?0.6:0.3}/>
        {/* Chip body */}
        <rect x="115" y="358" width="150" height="90" rx="12"
          fill="url(#chipGrad)"
          stroke={aC?'#7c3aed':'#c4b5fd'} strokeWidth={aC?2:1.4}/>
        {/* Top accent bar */}
        <rect x="115" y="358" width="150" height="12" rx="12"
          fill={aC?'#7c3aed':'#c4b5fd'} opacity={aC?0.7:0.3}/>
        <rect x="115" y="364" width="150" height="6"
          fill={aC?'#7c3aed':'#c4b5fd'} opacity={aC?0.7:0.3}/>
        <text x="190" y="386" textAnchor="middle" fontSize="9.5"
          fontFamily="monospace" letterSpacing="0.8" fontWeight="700"
          fill={aC?'#7c3aed':'#a78bfa'} opacity={aC?0.95:0.55}>DECODE UNIT</text>
        {/* Signal bars with color gradient */}
        {[18,30,14,42,26,36,16].map((h,i)=>{
          const barColors=['#3b82f6','#8b5cf6','#3b82f6','#7c3aed','#6366f1','#8b5cf6','#4f46e5'];
          return <rect key={i} x={130+i*14} y={432-h} width="10" height={h} rx="2"
            fill={aC?barColors[i]:'#c4b5fd'} opacity={aC?0.8:0.3}/>;
        })}
        {/* Chip pins */}
        {[372,386,400,414].map((y,i)=>(
          <g key={i}>
            <rect x="100" y={y-3} width="15" height="6" rx="2"
              fill={aC?'#ddd6fe':'#f1f5f9'} stroke={aC?'#7c3aed':'#c4b5fd'} strokeWidth="1"/>
            <rect x="265" y={y-3} width="15" height="6" rx="2"
              fill={aC?'#ddd6fe':'#f1f5f9'} stroke={aC?'#7c3aed':'#c4b5fd'} strokeWidth="1"/>
          </g>
        ))}
        <Anno x1={265} y1={402} x2={312} y2={387} label="COGNITION" sub="决策智能" right/>
      </g>

      {/* Corner brackets */}
      {([[16,16,1,1],[364,16,-1,1],[16,484,1,-1],[364,484,-1,-1]] as [number,number,number,number][]).map(([x,y,sx,sy],i)=><Bracket key={i} x={x} y={y} sx={sx} sy={sy}/>)}
    </svg>
  );
}

// ── Quantum ────────────────────────────────────────────────────────────────────

function QuantumIllustration({ hoveredCat }: { hoveredCat: string | null }) {
  const aP = active(hoveredCat,'perception');
  const aM = active(hoveredCat,'motion');
  const aC = active(hoveredCat,'cognition');
  const QUBITS = [{x:190,y:130},{x:120,y:185},{x:260,y:185},{x:80,y:270},{x:190,y:270},{x:300,y:270},{x:120,y:355},{x:260,y:355},{x:190,y:410}];
  const EDGES  = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7],[6,8],[7,8]];

  return (
    <svg viewBox="0 0 380 680" className="h-full w-auto" style={{ maxHeight:'100%' }}>
      <defs><FilterDef/></defs>

      {/* Connectivity — motion */}
      <g opacity={aM?0.5:0.18}>
        {EDGES.map(([a,b],i)=>(
          <line key={i} x1={QUBITS[a].x} y1={QUBITS[a].y} x2={QUBITS[b].x} y2={QUBITS[b].y}
            stroke={sc(hoveredCat,'motion')} strokeWidth={aM?1.4:0.9}/>
        ))}
      </g>
      <Anno x1={300} y1={270} x2={344} y2={254} label="MOTION" sub="运动控制" right/>

      {/* Bloch spheres — perception */}
      <g filter={aP?`url(#${FILTER_ID})`:undefined}>
        {QUBITS.map(({x,y},i)=>(
          <g key={i}>
            <circle cx={x} cy={y} r="22" fill={fc(hoveredCat,'perception')}
              stroke={sc(hoveredCat,'perception')} strokeWidth="1.4"/>
            <ellipse cx={x} cy={y} rx="22" ry="7" fill="none"
              stroke={sc(hoveredCat,'perception')} strokeWidth="0.8" opacity={aP?0.4:0.18}/>
            <line x1={x} y1={y-22} x2={x} y2={y+22}
              stroke={sc(hoveredCat,'perception')} strokeWidth="0.6" opacity={aP?0.35:0.15}/>
            <line x1={x} y1={y} x2={x+Math.cos(i*0.9)*14} y2={y+Math.sin(i*0.9)*14}
              stroke={aP?C.perception:DIM} strokeWidth="1.6"/>
            <circle cx={x+Math.cos(i*0.9)*14} cy={y+Math.sin(i*0.9)*14} r="3"
              fill={aP?C.perception:DIM}/>
          </g>
        ))}
        <Anno x1={80} y1={270} x2={30} y2={254} label="SENSOR" sub="感知系统"/>
      </g>

      {/* Gate circuit — cognition */}
      <g filter={aC?`url(#${FILTER_ID})`:undefined}>
        <rect x="100" y="460" width="180" height="130" rx="10"
          fill={fc(hoveredCat,'cognition')} stroke={sc(hoveredCat,'cognition')} strokeWidth="1.6"/>
        <text x="190" y="482" textAnchor="middle" fontSize="8" fontFamily="monospace"
          letterSpacing="1.2" fill={sc(hoveredCat,'cognition')} opacity={aC?0.8:0.4}>QUANTUM GATE</text>
        {['H','X','T','Z','S'].map((g,i)=>(
          <g key={g}>
            <rect x={115+i*30} y="495" width="22" height="22" rx="3"
              fill={aC?C.cognition+'20':DIMFILL} stroke={sc(hoveredCat,'cognition')} strokeWidth="1"/>
            <text x={126+i*30} y="510" textAnchor="middle" fontSize="9" fontFamily="monospace"
              fill={sc(hoveredCat,'cognition')} fontWeight="bold" opacity={aC?0.9:0.4}>{g}</text>
          </g>
        ))}
        {[530,548,566].map(y=>(
          <line key={y} x1="108" y1={y} x2="272" y2={y}
            stroke={sc(hoveredCat,'cognition')} strokeWidth="0.8" opacity={aC?0.35:0.15}/>
        ))}
        <Anno x1={280} y1={525} x2={336} y2={508} label="COGNITION" sub="决策智能" right/>
      </g>

      {([[16,16,1,1],[364,16,-1,1],[16,664,1,-1],[364,664,-1,-1]] as [number,number,number,number][]).map(([x,y,sx,sy],i)=><Bracket key={i} x={x} y={y} sx={sx} sy={sy}/>)}
    </svg>
  );
}

// ── Fusion ────────────────────────────────────────────────────────────────────

function FusionIllustration({ hoveredCat }: { hoveredCat: string | null }) {
  const aP = active(hoveredCat,'perception');
  const aM = active(hoveredCat,'motion');
  const aC = active(hoveredCat,'cognition');

  return (
    <svg viewBox="0 0 380 680" className="h-full w-auto" style={{ maxHeight:'100%' }}>
      <defs>
        <FilterDef/>
        <radialGradient id="plasma" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#f97316" stopOpacity={aP?"0.35":"0.08"}/>
          <stop offset="70%" stopColor="#ef4444" stopOpacity={aP?"0.12":"0.02"}/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>

      {/* Outer coils — motion */}
      <g filter={aM?`url(#${FILTER_ID})`:undefined}>
        {[140,112,84].map((r,i)=>(
          <circle key={i} cx="190" cy="270" r={r} fill="none"
            stroke={sc(hoveredCat,'motion')}
            strokeWidth={i===0?1.8:1} strokeDasharray={i===2?"4,4":""}
            opacity={aM?[0.85,0.5,0.25][i]:[0.22,0.15,0.08][i]}/>
        ))}
        {Array.from({length:16},(_,i)=>{
          const a=(i/16)*Math.PI*2;
          return <circle key={i} cx={190+Math.cos(a)*140} cy={270+Math.sin(a)*140} r="7"
            fill={fc(hoveredCat,'motion')} stroke={sc(hoveredCat,'motion')} strokeWidth="1.1"/>;
        })}
        <Anno x1={320} y1={152} x2={352} y2={136} label="MOTION" sub="运动控制" right/>
      </g>

      {/* Plasma — perception */}
      <g filter={aP?`url(#${FILTER_ID})`:undefined}>
        <circle cx="190" cy="270" r="66" fill="url(#plasma)"/>
        <circle cx="190" cy="270" r="66" fill="none"
          stroke={sc(hoveredCat,'perception')} strokeWidth="1.6" opacity={aP?0.7:0.2}/>
        {Array.from({length:8},(_,i)=>{
          const a=(i/8)*Math.PI*2;
          return <line key={i}
            x1={190+Math.cos(a)*30} y1={270+Math.sin(a)*30}
            x2={190+Math.cos(a+0.3)*62} y2={270+Math.sin(a+0.3)*62}
            stroke={sc(hoveredCat,'perception')} strokeWidth="1.2" opacity={aP?0.45:0.12}/>;
        })}
        <circle cx="190" cy="270" r="22" fill={aP?'#fdba7430':DIMFILL}
          stroke={sc(hoveredCat,'perception')} strokeWidth="1.3"/>
        <Anno x1={133} y1={222} x2={68} y2={205} label="SENSOR" sub="感知系统"/>
      </g>

      {/* Control — cognition */}
      <g filter={aC?`url(#${FILTER_ID})`:undefined}>
        <rect x="90" y="450" width="200" height="112" rx="10"
          fill={fc(hoveredCat,'cognition')} stroke={sc(hoveredCat,'cognition')} strokeWidth="1.6"/>
        <text x="190" y="473" textAnchor="middle" fontSize="8" fontFamily="monospace"
          letterSpacing="1.2" fill={sc(hoveredCat,'cognition')} opacity={aC?0.8:0.4}>CONTROL SYSTEM</text>
        {[130,170,210,250].map((cx,i)=>(
          <g key={i}>
            <circle cx={cx} cy="510" r="16" fill={fc(hoveredCat,'cognition')}
              stroke={sc(hoveredCat,'cognition')} strokeWidth="1.1"/>
            <line x1={cx} y1="510" x2={cx+Math.cos(-0.8+i*0.6)*11} y2={510+Math.sin(-0.8+i*0.6)*11}
              stroke={aC?C.cognition:DIM} strokeWidth="1.6"/>
          </g>
        ))}
        {[0,1,2].map(i=>{
          const w=[80,55,95][i];
          return <g key={i}>
            <rect x="108" y={535+i*12} width="164" height="6" rx="3" fill={DIMFILL}/>
            <rect x="108" y={535+i*12} width={w} height="6" rx="3"
              fill={aC?C.cognition:DIM} opacity={aC?0.7:0.3}/>
          </g>;
        })}
        <Anno x1={290} y1={505} x2={342} y2={490} label="COGNITION" sub="决策智能" right/>
      </g>

      {([[16,16,1,1],[364,16,-1,1],[16,664,1,-1],[364,664,-1,-1]] as [number,number,number,number][]).map(([x,y,sx,sy],i)=><Bracket key={i} x={x} y={y} sx={sx} sy={sy}/>)}
    </svg>
  );
}
