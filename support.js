/* LevelUp Pickleball — upcoming events board (10s seamless loop, 1920x1080). */
const { CompositionStage, useComposition, animate, Easing, clamp } = window;

const NAVY = '#0A2540';
const BLUE = '#0E4FD8';
const BLUE_SOFT = '#E6EDFF';
const GREEN = '#4CB74B';
const GREEN_SOFT = '#E8F7E6';
const INK = '#0A1B2A';

const DISPLAY = "'Bricolage Grotesque', system-ui, sans-serif";
const NUM = "'Barlow Condensed', system-ui, sans-serif";

const MOTION = {
  enter: (from, to, start, end) => animate({ from, to, start, end, ease: Easing.easeOutCubic }),
  pop: (from, to, start, end) => animate({ from, to, start, end, ease: Easing.easeOutBack }),
  drift: (from, to, start, end) => animate({ from, to, start, end, ease: Easing.easeInOutSine }),
};

const mix = (a, b, t) => a + (b - a) * t;

function EventCard({ ev, isNext, width, lift, vis }) {
  const y = mix(150, 0, vis) - 18 * lift;
  const scale = 1 + 0.035 * lift;
  return (
    <div style={{
      width, flex: '0 0 auto', boxSizing: 'border-box', borderRadius: 30, background: '#ffffff',
      overflow: 'hidden', border: `4px solid ${isNext ? GREEN : BLUE_SOFT}`,
      boxShadow: `0 ${18 + 26 * lift}px ${34 + 40 * lift}px rgba(10,37,64,${0.10 + 0.12 * lift})`,
      transform: `translateY(${y}px) scale(${scale})`, transformOrigin: '50% 100%',
      opacity: vis, display: 'flex', flexDirection: 'column',
    }}>
      <div style={{
        background: isNext ? GREEN : BLUE, color: '#ffffff', padding: '14px 0 16px', textAlign: 'center',
      }}>
        <div style={{ height: 26, marginBottom: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isNext ? (
            <div style={{
              background: '#ffffff', color: GREEN, fontFamily: DISPLAY, fontWeight: 800, fontSize: 17,
              letterSpacing: '0.12em', padding: '5px 12px', borderRadius: 999, textTransform: 'uppercase',
            }}>Next up</div>
          ) : null}
        </div>
        <div style={{
          fontFamily: DISPLAY, fontWeight: 800, fontSize: 30, letterSpacing: '0.14em',
          textTransform: 'uppercase', opacity: 0.9,
        }}>{ev.weekday}</div>
        <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 92, lineHeight: 0.9, letterSpacing: '-0.02em' }}>
          {ev.day}
        </div>
        <div style={{
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 23, letterSpacing: '0.2em',
          textTransform: 'uppercase', opacity: 0.85, marginTop: 4,
        }}>{ev.month}</div>
      </div>
      <div style={{
        flex: 1, padding: '20px 22px 22px', display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between', gap: 14, minHeight: 0,
      }}>
        <div style={{
          fontFamily: DISPLAY, fontWeight: 800, fontSize: 36, lineHeight: 1.04,
          color: INK, textWrap: 'pretty', letterSpacing: '-0.01em',
        }}>{ev.name}</div>
        {ev.time ? (
          <div style={{
            alignSelf: 'flex-start', background: isNext ? GREEN_SOFT : BLUE_SOFT,
            color: isNext ? '#2E7D2C' : BLUE, borderRadius: 14, padding: '8px 14px',
            fontFamily: NUM, fontWeight: 700, fontSize: 36, letterSpacing: '0.02em',
          }}>{ev.time}</div>
        ) : null}
      </div>
    </div>
  );
}

function Piece(props) {
  const { T, CUES, authoredTotal } = useComposition();
  const events = props.events || [];
  const n = Math.max(events.length, 1);
  const gap = 24;
  const cardW = Math.min(300, Math.floor((1920 - 96 - gap * (n - 1)) / n));

  const R = CUES.Reveal, C = CUES.Close;
  const HEADER = 196;

  // panel: 1 = navy fills the screen (splash), 0 = collapsed to the header band
  let panel;
  if (T < R) panel = 1;
  else if (T < R + 1.0) panel = MOTION.drift(1, 0, R, R + 1.0)(T);
  else if (T < C) panel = 0;
  else panel = MOTION.drift(0, 1, C, authoredTotal)(T);

  const panelH = mix(HEADER, 1080, panel);

  // logo pose interpolates between its header slot and the splash centre
  const logoH = mix(96, 250, panel);
  const logoW = logoH * (2704 / 988);
  const logoX = mix(56, 960 - logoW / 2, panel);
  const logoY = mix((HEADER - 96) / 2, 372, panel);

  const fadeOut = (start, end) => (T > start ? MOTION.drift(1, 0, start, end)(T) : 1);
  const HIT = 0.6;
  const logoIn = clamp(MOTION.pop(0, 1, HIT, 1.5)(T) * fadeOut(C + 0.45, authoredTotal), 0, 1);
  const hideSplash = fadeOut(R - 0.5, R + 0.05);
  const splashText = MOTION.enter(0, 1, 1.4, 2.1)(T) * hideSplash;
  const underline = MOTION.enter(0, 1, 1.7, 2.5)(T) * hideSplash;
  const ring1 = MOTION.enter(0, 1, HIT, 1.6)(T);
  const ring2 = MOTION.enter(0, 1, HIT + 0.12, 1.8)(T);
  const rays = MOTION.enter(0, 1, HIT, 1.05)(T);
  const burst = T >= HIT ? 1 : 0;
  const shake = T > HIT && T < HIT + 0.5 ? (1 - (T - HIT) / 0.5) * Math.sin((T - HIT) * 78) * 9 : 0;
  const bars = [0, 1, 2].map(i => MOTION.enter(0, 1, HIT + 0.05 + i * 0.12, HIT + 1.05 + i * 0.12)(T) * fadeOut(C + 0.1, authoredTotal));
  const court = MOTION.enter(0, 1, 0.1, 1.3)(T) * fadeOut(C, authoredTotal);
  const push = T < R ? MOTION.drift(0, 1, 2.0, R)(T) : fadeOut(C + 0.2, authoredTotal);
  const ballAX = animate({ from: -320, to: 900, start: 0, end: HIT, ease: Easing.easeInQuad });
  const ballAY = animate({ from: -300, to: 452, start: 0, end: HIT, ease: Easing.easeInQuad });
  const ballBX = animate({ from: 900, to: 2260, start: HIT, end: 1.5, ease: Easing.easeOutQuad });
  const ballBY = animate({ from: 452, to: 1340, start: HIT, end: 1.5, ease: Easing.easeOutQuad });
  const ballPose = (t) => (t <= HIT
    ? { x: ballAX(t), y: ballAY(t) }
    : { x: ballBX(t), y: ballBY(t) });
  const ballVis = (T < 1.5 ? 1 : 0) * panel;

  const headIn = MOTION.enter(0, 1, R + 0.3, R + 1.0)(T);
  const headOut = T > C - 0.2 ? MOTION.drift(1, 0, C - 0.2, C + 0.35)(T) : 1;
  const head = headIn * headOut;
  const ruleW = MOTION.enter(0, 1, R + 0.6, R + 1.9)(T) * headOut;

  const footIn = MOTION.pop(0, 1, R + 1.05, R + 1.85)(T);
  const footOut = T > C - 0.1 ? MOTION.drift(1, 0, C - 0.1, C + 0.4)(T) : 1;
  const foot = clamp(footIn * footOut, 0, 1);

  const sweep = (CUES.Board || 3.4) + 0.2;
  const qrPulse = (1 + Math.sin(((T - R) / 1.8) * Math.PI * 2 - Math.PI / 2)) / 2;
  const showQr = props.showQr !== false;

  const blobX = Math.sin((T / authoredTotal) * Math.PI * 2) * 90;
  const blobY = Math.cos((T / authoredTotal) * Math.PI * 2) * 40;

  function pulseAt(at) {
    const half = 0.5;
    if (T < at - half || T > at + half) return 0;
    if (T <= at) return MOTION.pop(0, 1, at - half, at)(T);
    return MOTION.drift(1, 0, at, at + half)(T);
  }
  function lift(i) {
    return Math.max(pulseAt(sweep + i * 0.5), pulseAt(sweep + 5.0 + i * 0.5));
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, background: '#ffffff', overflow: 'hidden',
      fontFamily: DISPLAY, color: INK,
    }}>
      <div style={{
        position: 'absolute', width: 900, height: 900, borderRadius: '50%', left: 120, top: 340,
        background: GREEN, opacity: 0.10, filter: 'blur(6px)',
        transform: `translate(${blobX}px, ${blobY}px)`,
      }} />
      <div style={{
        position: 'absolute', width: 700, height: 700, borderRadius: '50%', right: -120, top: 420,
        background: BLUE, opacity: 0.08,
        transform: `translate(${-blobX}px, ${-blobY}px)`,
      }} />

      {/* headline */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: HEADER, padding: '38px 56px 0', zIndex: 4,
        opacity: head, transform: `translateY(${mix(26, 0, head)}px)`,
      }}>
        <div style={{
          fontFamily: DISPLAY, fontWeight: 800, fontSize: 70, lineHeight: 1,
          letterSpacing: '-0.02em', textTransform: 'uppercase',
        }}>
          Upcoming <span style={{ color: GREEN }}>Events</span>
        </div>
        <div style={{
          height: 9, borderRadius: 999, background: BLUE, marginTop: 14,
          width: `${ruleW * 100}%`, maxWidth: 1808,
        }} />
      </div>

      {/* cards */}
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 392, display: 'flex', gap,
        padding: '0 48px', alignItems: 'stretch', height: 462, zIndex: 4,
      }}>
        {events.map((ev, i) => (
          <EventCard
            key={ev.key || i}
            ev={ev}
            width={cardW}
            isNext={i === 0}
            lift={lift(i)}
            vis={clamp(MOTION.enter(0, 1, R + 0.45 + i * 0.1, R + 1.3 + i * 0.1)(T)
              * (T > C - 0.15 ? MOTION.drift(1, 0, C - 0.15, C + 0.5)(T) : 1), 0, 1)}
          />
        ))}
        {events.length === 0 ? (
          <div style={{
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, color: '#8494A6',
            display: 'flex', alignItems: 'center', opacity: head,
          }}>Loading events…</div>
        ) : null}
      </div>

      {/* footer */}
      <div style={{
        position: 'absolute', left: 48, right: 48, bottom: 40, height: 172,
        display: 'flex', gap: 24, zIndex: 4,
        opacity: foot, transform: `translateY(${mix(60, 0, foot)}px)`,
      }}>
        <div style={{
          flex: 1, background: GREEN, borderRadius: 30, padding: '0 44px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#ffffff',
        }}>
          <div style={{
            fontFamily: DISPLAY, fontWeight: 800, fontSize: 52, letterSpacing: '-0.01em',
            textTransform: 'uppercase', lineHeight: 1.05,
          }}>{props.ctaTitle}</div>
          <div style={{
            fontFamily: DISPLAY, fontWeight: 600, fontSize: 26, letterSpacing: '0.14em',
            opacity: 0.92, marginTop: 8, textTransform: 'uppercase',
          }}>{props.ctaSub}</div>
        </div>
        {showQr ? (
          <div style={{
            width: 172, boxSizing: 'border-box', borderRadius: 30, background: '#ffffff',
            border: `4px solid ${NAVY}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: `scale(${1 + 0.03 * qrPulse})`,
            boxShadow: `0 ${14 + 14 * qrPulse}px ${28 + 22 * qrPulse}px rgba(10,37,64,0.16)`,
          }}>
            <img src="./signup-qr.png" alt="Scan to sign up" style={{ width: 126, height: 126, display: 'block' }} />
          </div>
        ) : null}
      </div>

      {/* navy panel — full-bleed splash that collapses into the header band */}
      <div style={{
        position: 'absolute', left: 0, top: 0, width: 1920, height: panelH,
        background: NAVY, zIndex: 5, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, width: 1920, height: 1080,
          transform: `translate(${shake}px, ${shake * 0.5}px) scale(${mix(1, 1.05, push * panel)})`, transformOrigin: '50% 46%',
        }}>
          <svg width="1920" height="1080" style={{
            position: 'absolute', left: 0, top: 0, opacity: 0.14 * panel * court,
          }}>
            <g stroke="#ffffff" strokeWidth="4" fill="none">
              <rect x="330" y="150" width="1260" height="790" rx="4" />
              <line x1="330" y1="545" x2="1590" y2="545" />
              <line x1="960" y1="150" x2="960" y2="410" />
              <line x1="960" y1="680" x2="960" y2="940" />
              <line x1="330" y1="410" x2="1590" y2="410" />
              <line x1="330" y1="680" x2="1590" y2="680" />
            </g>
          </svg>
          {[{ p: ring1, c: GREEN, max: 1180, w: 8 }, { p: ring2, c: BLUE, max: 860, w: 5 }].map((r, i) => (
            <div key={i} style={{
              position: 'absolute', left: 960, top: 498,
              width: mix(110, r.max, r.p), height: mix(110, r.max, r.p),
              marginLeft: -mix(55, r.max / 2, r.p), marginTop: -mix(55, r.max / 2, r.p),
              borderRadius: '50%', border: `${r.w}px solid ${r.c}`,
              opacity: (1 - r.p) * 0.75 * panel * burst,
            }} />
          ))}
          <div style={{
            position: 'absolute', left: 960, top: 498, width: 0, height: 0,
            opacity: (1 - rays) * 0.9 * panel * burst,
          }}>
            {[20, 68, 112, 160, 200, 248, 292, 340].map((a, i) => (
              <div key={i} style={{
                position: 'absolute', left: -3, top: 0, width: 9, height: mix(70, 300, rays),
                background: i % 2 ? BLUE : GREEN, borderRadius: 999,
                transform: `rotate(${a}deg) translateY(${mix(60, 150, rays)}px)`,
                transformOrigin: '50% 0%',
              }} />
            ))}
          </div>
          {[0, 1].map((g) => {
            const pose = ballPose(T - g * 0.045);
            const d = 96 - g * 8;
            return (
              <div key={g} style={{
                position: 'absolute', left: pose.x - d / 2, top: pose.y - d / 2, width: d, height: d,
                borderRadius: '50%', background: GREEN,
                opacity: ballVis * (g === 0 ? 1 : 0.2),
                boxShadow: g === 0 ? '0 0 0 5px rgba(255,255,255,0.28)' : 'none',
              }}>
                {g === 0 ? (
                  <svg width={d} height={d} viewBox="0 0 96 96">
                    {[[30, 27], [64, 25], [48, 48], [27, 62], [67, 60], [46, 78], [78, 43], [20, 43]].map((c, i) => (
                      <circle key={i} cx={c[0]} cy={c[1]} r="6" fill="#ffffff" fillOpacity="0.92" />
                    ))}
                  </svg>
                ) : null}
              </div>
            );
          })}
          {[{ t: 214, h: 26, c: GREEN, d: -1 }, { t: 858, h: 16, c: BLUE, d: 1 }, { t: 908, h: 8, c: GREEN, d: 1 }].map((b, i) => (
            <div key={i} style={{
              position: 'absolute', left: 0, top: b.t, width: 1920, height: b.h, background: b.c,
              transform: `translateX(${mix(2200 * b.d, 0, bars[i])}px) rotate(-9deg)`,
              opacity: 0.92 * panel,
            }} />
          ))}
          <div style={{ position: 'absolute', left: 0, right: 0, top: 656, textAlign: 'center' }}>
            <div style={{
              fontFamily: DISPLAY, fontWeight: 800, fontSize: 62, letterSpacing: '0.24em',
              color: GREEN, textTransform: 'uppercase', opacity: splashText * panel,
              transform: `translateY(${mix(34, 0, splashText)}px)`,
            }}>Upcoming Events</div>
            <div style={{
              height: 8, borderRadius: 999, background: '#ffffff', margin: '26px auto 0',
              width: mix(0, 520, underline), opacity: 0.85 * underline * panel,
            }} />
          </div>
        </div>
      </div>

      <img
        src="./levelup-logo.png"
        alt="LevelUp Pickleball"
        style={{
          position: 'absolute', left: logoX, top: logoY, height: logoH, width: 'auto',
          display: 'block', zIndex: 6, opacity: mix(1, logoIn, panel),
          transform: `translateY(${mix(0, mix(38, 0, logoIn), panel)}px) scale(${mix(1, mix(0.74, 1, logoIn) * mix(1, 1.05, push), panel)}) rotate(${mix(0, mix(-4, 0, logoIn), panel)}deg)`,
          transformOrigin: '50% 50%',
        }}
      />

      {props.showClock === false ? null : (
        <div style={{
          position: 'absolute', right: 56, top: 44, textAlign: 'right', color: '#ffffff',
          zIndex: 6, opacity: 1 - panel,
        }}>
          <div style={{
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 22, letterSpacing: '0.24em',
            opacity: 0.6, textTransform: 'uppercase',
          }}>{props.dateLine}</div>
          <div style={{ fontFamily: NUM, fontWeight: 700, fontSize: 72, lineHeight: 1, letterSpacing: '0.01em' }}>
            {props.clock}
          </div>
        </div>
      )}
    </div>
  );
}

function EventsBoardStage(props) {
  return (
    <CompositionStage
      width={1920}
      height={1080}
      scenes={window.OM_SCENES}
      playback={window.OM_PLAYBACK}
      bg="#ffffff"
    >
      <Piece {...props} />
    </CompositionStage>
  );
}

window.EventsBoardStage = EventsBoardStage;
module.exports = { EventsBoardStage };
