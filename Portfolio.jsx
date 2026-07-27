import { useState, useRef, useEffect } from "react";

/* ─── GLOBAL STYLES ─────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;600&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 100%; height: 100vh;
    display: flex; justify-content: center; align-items: center;
    perspective: 1000px; overflow: hidden;
    background: #212121; font-family: 'Inter', sans-serif;
  }
  @keyframes slide { 0% { left: -100%; } 100% { left: 100%; } }
  .pscroll { scrollbar-width: thin; scrollbar-color: red transparent; }
  .pscroll::-webkit-scrollbar { width: 4px; }
  .pscroll::-webkit-scrollbar-track { background: transparent; }
  .pscroll::-webkit-scrollbar-thumb { background: red; border-radius: 2px; }
`;

function injectGlobal() {
  if (document.getElementById("pf-global")) return;
  const el = document.createElement("style");
  el.id = "pf-global";
  el.textContent = globalCSS;
  document.head.appendChild(el);
}

/* ─── BG IMAGES ─────────────────────────────────────────────── */
const BG = {
  home: "linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.6)),url(https://images.unsplash.com/photo-1469474968028-56623f02e42e?crop=entropy&cs=tinysrgb&fm=jpg&q=80&auto=format&fit=crop&w=1174)",
  project: "linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.6)),url(https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?crop=entropy&cs=tinysrgb&fm=jpg&q=80&auto=format&fit=crop&w=1170)",
  about: "linear-gradient(to bottom,rgba(0,0,0,.2),rgba(0,0,0,.6)),url(https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?crop=entropy&cs=tinysrgb&fm=jpg&q=80&auto=format&fit=crop&w=1170)",
};

/* ─── CARD ───────────────────────────────────────────────────── */
function Card({ year, title, desc }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{ background:"#2a2a2a", border:`1px solid ${h?"rgb(212,64,101)":"rgba(255,255,255,.07)"}`, borderRadius:8, padding:"1.8rem", transition:"transform .3s,border-color .3s", transform:h?"translateY(-4px)":"none" }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    >
      <span style={{ fontSize:"0.75rem", color:"rgb(212,64,101)", letterSpacing:"0.2em", textTransform:"uppercase" }}>{year}</span>
      <h3 style={{ fontSize:"1.1rem", color:"#fff", margin:"0.6rem 0 0.4rem" }}>{title}</h3>
      <p style={{ fontSize:"0.85rem", color:"rgba(255,255,255,.5)", fontWeight:300 }}>{desc}</p>
    </div>
  );
}

/* ─── PROJECT ITEM ───────────────────────────────────────────── */
function ProjectItem({ num, year, title, desc, tags }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{ padding:`2.5rem 0 2.5rem ${h?"1rem":"0"}`, borderBottom:"1px solid rgba(255,255,255,.08)", transition:"padding-left .3s" }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    >
      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"0.75rem", color:"rgb(212,64,101)", letterSpacing:"0.2em", marginBottom:"0.8rem" }}>
        <span>{num}</span><span>{year}</span>
      </div>
      <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.8rem", color:"#fff", letterSpacing:"0.05em", marginBottom:"0.6rem" }}>{title}</h3>
      <p style={{ fontSize:"0.9rem", color:"rgba(255,255,255,.55)", fontWeight:300, lineHeight:1.7, marginBottom:"1rem" }}>{desc}</p>
      <div style={{ display:"flex", gap:"0.6rem", flexWrap:"wrap" }}>
        {tags.map(t=>(
          <span key={t} style={{ fontSize:"0.7rem", letterSpacing:"0.15em", textTransform:"uppercase", padding:"0.3rem 0.8rem", border:"1px solid rgba(212,64,101,.4)", borderRadius:20, color:"rgba(212,64,101,.8)" }}>{t}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── PAGE CONTENTS (return fragments — no scroll wrapper) ───── */
function HomeContent() {
  return (
    <>
      <div style={{ ...hero, backgroundImage: BG.home }}>
        <h1 style={titleStyle}>Home</h1>
        <p style={subtitleStyle}>Welcome to S's world</p>
      </div>

      <section style={{ ...section, background:"#212121" }}>
        <div style={block}>
          <h2 style={h2}>Latest Work</h2>
          <p style={body}>A selection of recent projects spanning web design, interactive experiences, and digital art direction. Each piece reflects a commitment to craft and intentionality.</p>
        </div>
        <div style={cardsGrid}>
          <Card year="2024" title="Brand Identity" desc="Visual system for a tech startup" />
          <Card year="2024" title="Web App" desc="Dashboard for real-time analytics" />
          <Card year="2023" title="Motion Design" desc="Animated campaign for a music label" />
        </div>
      </section>

      <section style={{ ...section, background:"#1a1a1a" }}>
        <div style={{ ...block, textAlign:"center" }}>
          <h2 style={h2}>Philosophy</h2>
          <p style={body}>Design is not decoration. It's the bridge between idea and experience — built with intention, executed with precision, and felt in the details nobody notices but everyone feels.</p>
        </div>
      </section>

      <section style={{ ...section, background:"#212121" }}>
        <div style={{ display:"flex", justifyContent:"center", gap:"5rem", flexWrap:"wrap" }}>
          {[["47","Projects"],["12","Years"],["30+","Clients"]].map(([n,l])=>(
            <div key={l} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"0.4rem" }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"4rem", color:"rgb(212,64,101)" }}>{n}</span>
              <span style={{ fontSize:"0.8rem", letterSpacing:"0.25em", textTransform:"uppercase", color:"rgba(255,255,255,.5)" }}>{l}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function ProjectContent() {
  const projects = [
    { num:"01", year:"2024", title:"Parallax Portfolio", desc:"A depth-driven showcase using layered scroll animations and WebGL for an immersive browsing experience.", tags:["WebGL","GSAP","Three.js"] },
    { num:"02", year:"2024", title:"Real-time Dashboard", desc:"Live data visualization platform built with React and D3, processing thousands of events per second.", tags:["React","D3","WebSocket"] },
    { num:"03", year:"2023", title:"E-commerce Redesign", desc:"Complete UX overhaul for a fashion brand — conversion rate increased by 34% post-launch.", tags:["Figma","Next.js","Shopify"] },
    { num:"04", year:"2023", title:"Generative Art Tool", desc:"Browser-based creative tool for generating parametric patterns, exportable as SVG or canvas.", tags:["Canvas API","Vanilla JS"] },
  ];
  return (
    <>
      <div style={{ ...hero, backgroundImage: BG.project }}>
        <h1 style={titleStyle}>Projects</h1>
        <p style={subtitleStyle}>Selected works &amp; experiments</p>
      </div>
      <section style={{ ...section, background:"#212121" }}>
        <div style={{ maxWidth:800, margin:"0 auto" }}>
          {projects.map(p=><ProjectItem key={p.num} {...p} />)}
        </div>
      </section>
    </>
  );
}

function AboutContent() {
  return (
    <>
      <div style={{ ...hero, backgroundImage: BG.about }}>
        <h1 style={titleStyle}>Frontend Developer</h1>
        <p style={subtitleStyle}>Building the visible layer of the web</p>
      </div>

      <section style={{ ...section, background:"#212121" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", maxWidth:900, margin:"0 auto" }}>
          <div>
            <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"3rem", color:"#fff", marginBottom:"1.2rem" }}>Hello.</h2>
            <p style={{ ...body, marginBottom:"1rem" }}>I'm a frontend developer with a designer's eye. I care deeply about the intersection of code and aesthetics — where performance meets beauty and interaction meets meaning.</p>
            <p style={body}>Based in Paris, working globally. Available for freelance, full-time, and collaborations that push creative boundaries.</p>
          </div>
          <div>
            <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"1.5rem", color:"#fff", letterSpacing:"0.05em", marginBottom:"1rem" }}>Skills</h3>
            <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"0.6rem" }}>
              {["HTML / CSS / JavaScript","React / Next.js / Vue","GSAP / Three.js / WebGL","Figma / Motion Design","TypeScript / Node.js"].map(sk=>(
                <li key={sk} style={{ fontSize:"0.9rem", color:"rgba(255,255,255,.55)", paddingLeft:"1.5rem", position:"relative", fontWeight:300 }}>
                  <span style={{ position:"absolute", left:0, color:"rgb(212,64,101)" }}>—</span>{sk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section style={{ ...section, background:"#1a1a1a" }}>
        <div style={{ ...block, textAlign:"center" }}>
          <h2 style={h2}>Experience</h2>
          <div style={{ display:"flex", flexDirection:"column", gap:"1.5rem", marginTop:"2rem", maxWidth:500, marginLeft:"auto", marginRight:"auto", textAlign:"left" }}>
            {[["2022–now","Senior Frontend Dev","Studio Lumière, Paris"],["2019–2022","Frontend Engineer","Agence Numérique, Lyon"],["2017–2019","Web Designer","Freelance"]].map(([yr,role,place])=>(
              <div key={yr} style={{ display:"flex", gap:"2rem", alignItems:"flex-start" }}>
                <span style={{ fontSize:"0.75rem", color:"rgb(212,64,101)", letterSpacing:"0.15em", whiteSpace:"nowrap", paddingTop:"0.15rem", minWidth:90 }}>{yr}</span>
                <div style={{ fontSize:"0.9rem", color:"rgba(255,255,255,.6)", fontWeight:300, lineHeight:1.6 }}>
                  <strong style={{ color:"#fff", fontWeight:600 }}>{role}</strong> — {place}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...section, background:"#212121" }}>
        <div style={{ textAlign:"center" }}>
          <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.5rem", color:"#fff", letterSpacing:"0.05em", marginBottom:"0.8rem" }}>Get in touch</h2>
          <p style={{ fontSize:"1.1rem", color:"rgba(255,255,255,.5)", marginBottom:"2rem" }}>hello@example.com</p>
          <div style={{ display:"flex", justifyContent:"center", gap:"2rem" }}>
            {["GitHub","LinkedIn","Dribbble"].map(lk=>(
              <SocialLink key={lk} label={lk} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function SocialLink({ label }) {
  const [h, setH] = useState(false);
  return (
    <span
      style={{ fontSize:"0.8rem", letterSpacing:"0.2em", textTransform:"uppercase", color:h?"rgb(212,64,101)":"rgba(255,255,255,.4)", cursor:"pointer", transition:"color .3s" }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
    >{label}</span>
  );
}

/* ─── NAV LINK ───────────────────────────────────────────────── */
function NavLink({ label, onClick }) {
  const [h, setH] = useState(false);
  return (
    <li
      style={{ position:"relative", color:h?"red":"#fff", textTransform:"capitalize", fontSize:20, padding:10, letterSpacing:"2px", listStyle:"none", fontWeight:600, cursor:"pointer", transition:"color .5s, opacity .5s, transform .5s", opacity:h?0.8:1, transform:h?"translateX(-20px)":"none" }}
      onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      onClick={onClick}
    >{label}</li>
  );
}

/* ─── SHARED STYLE TOKENS ────────────────────────────────────── */
const hero = { width:"100%", height:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", backgroundSize:"cover", backgroundPosition:"center" };
const titleStyle = { fontFamily:"'Bebas Neue',sans-serif", fontSize:"clamp(3rem,8vw,6rem)", color:"#fff", textTransform:"uppercase", letterSpacing:"0.05em", textShadow:"3px 3px 20px rgba(0,0,0,.5)", textAlign:"center" };
const subtitleStyle = { fontSize:"1rem", color:"rgba(255,255,255,.7)", letterSpacing:"0.3em", textTransform:"uppercase", marginTop:"1rem", fontWeight:300 };
const section = { width:"100%", padding:"5rem 3rem", color:"#e0e0e0" };
const block = { maxWidth:700, margin:"0 auto" };
const h2 = { fontFamily:"'Bebas Neue',sans-serif", fontSize:"2.5rem", color:"#fff", letterSpacing:"0.05em", marginBottom:"1.2rem" };
const body = { fontSize:"1rem", lineHeight:1.8, color:"rgba(255,255,255,.65)", fontWeight:300 };
const cardsGrid = { display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"1.5rem", maxWidth:900, margin:"3rem auto 0" };

/* ─── APP ────────────────────────────────────────────────────── */
const PAGE_CONTENTS = [<HomeContent />, <ProjectContent />, <AboutContent />];
const PAGE_LABELS = ["Home", "Project", "About"];

export default function Portfolio() {
  useEffect(() => { injectGlobal(); }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [activePage, setActivePage] = useState(0);
  const [sliding, setSliding] = useState(false);
  const scrollRefs = useRef([]);

  function openMenu() {
    scrollRefs.current[activePage]?.scrollTo({ top:0, behavior:"smooth" });
    setMenuOpen(true);
  }
  function closeMenu() { setMenuOpen(false); }

  function goTo(index) {
    closeMenu();
    if (index === activePage) return;
    setSliding(true);
    setTimeout(() => {
      scrollRefs.current[index] && (scrollRefs.current[index].scrollTop = 0);
      setActivePage(index);
    }, 500);
    setTimeout(() => setSliding(false), 1000);
  }

  return (
    <>
      {/* NAVBAR */}
      <nav style={{ width:"100%", height:60, position:"fixed", top:0, left:0, padding:"0 3rem", display:"flex", justifyContent:"space-between", alignItems:"center", zIndex:100 }}>
        <div
          style={{ position:"relative", width:50, height:50, cursor:"pointer", zIndex:101 }}
          onClick={() => menuOpen ? closeMenu() : openMenu()}
        >
          {menuOpen ? (
            <>
              <span style={{ ...burgerSpan, top:"50%", transform:"rotate(45deg)" }} />
              <span style={{ ...burgerSpan, top:"50%", transform:"rotate(-45deg)", width:"100%" }} />
            </>
          ) : (
            <>
              <span style={{ ...burgerSpan, top:"25%", transform:"translateY(-50%)" }} />
              <span style={{ ...burgerSpan, top:"50%", width:"70%" }} />
              <span style={{ ...burgerSpan, top:"75%", width:"40%" }} />
            </>
          )}
        </div>
      </nav>

      {/* CLOSE OVERLAY (click anywhere on page to close menu) */}
      {menuOpen && <div style={{ position:"fixed", inset:0, zIndex:50, cursor:"pointer" }} onClick={closeMenu} />}

      {/* NAV LIST */}
      <ul style={{ position:"fixed", top:"40%", right:"10vw", opacity:menuOpen?1:0, fontFamily:"sans-serif", zIndex:99, pointerEvents:menuOpen?"all":"none", transition:"opacity .4s ease", listStyle:"none" }}>
        {PAGE_LABELS.map((label, i) => (
          <NavLink key={label} label={label} onClick={() => goTo(i)} />
        ))}
      </ul>

      {/* PAGE CONTAINER — 3D flip */}
      <div style={{
        position:"relative", width:"100%", height:"100%",
        transition:"transform 1s cubic-bezier(.77,0,.18,1), left 1s cubic-bezier(.77,0,.18,1)",
        transformOrigin:"left center",
        left: menuOpen ? "-10px" : "0",
        transform: menuOpen ? "rotateY(45deg) scale(0.5)" : "none",
      }}>
        {/* SLIDE TRANSITION OVERLAY */}
        <span style={{
          position:"fixed", bottom:0, left:"-100%",
          height:"100%", width:"100%",
          background:"#212121", zIndex:3, pointerEvents:"none",
          animation: sliding ? "slide 1s linear 1" : "none",
        }} />

        {/* PAGES */}
        {PAGE_CONTENTS.map((content, i) => (
          <section
            key={i}
            style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", zIndex:1, overflow:"hidden", opacity:activePage===i?1:0, pointerEvents:activePage===i?"all":"none", transition:"opacity .5s ease" }}
          >
            <div
              ref={el => scrollRefs.current[i] = el}
              className="pscroll"
              style={{ width:"100%", height:"100%", overflowY:"auto", overflowX:"hidden", scrollBehavior:"smooth" }}
            >
              {content}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

const burgerSpan = { position:"absolute", left:0, width:"100%", height:3, background:"red", transition:"1s" };
