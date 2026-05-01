import { useState, useRef } from "react";

const SIZES = [
  { label:"Mini (~8cm)",      hook:"2.0–2.5mm", magic:6  },
  { label:"Pequeño (~12cm)",  hook:"2.5–3.0mm", magic:6  },
  { label:"Mediano (~18cm)",  hook:"3.0–3.5mm", magic:6  },
  { label:"Grande (~25cm)",   hook:"3.5–4.0mm", magic:8  },
];

const LEVELS = [
  {
    id: "beginner",
    label: "Principiante",
    emoji: "🌱",
    desc: "Primera vez tejiendo amigurumis",
    color: "#16a34a",
    bg: "#f0fdf4",
    border: "#86efac",
    headerBg: "linear-gradient(135deg,#16a34a,#059669)",
  },
  {
    id: "intermediate",
    label: "Intermedio",
    emoji: "🌿",
    desc: "Conozco los puntos básicos",
    color: "#d97706",
    bg: "#fffbeb",
    border: "#fcd34d",
    headerBg: "linear-gradient(135deg,#d97706,#b45309)",
  },
  {
    id: "advanced",
    label: "Avanzado",
    emoji: "🌸",
    desc: "Experiencia en amigurumis",
    color: "#7c3aed",
    bg: "#fdf4ff",
    border: "#c4b5fd",
    headerBg: "linear-gradient(135deg,#6b2fa0,#d946a8)",
  },
];

const ABBR_BEGINNER = [
  ["Anillo mágico","Nudo inicial del que salen los primeros puntos en círculo"],
  ["Punto medio (pm)","El punto básico del crochet, también llamado punto bajo"],
  ["Aumento (aum)","Hacer 2 puntos en el mismo hueco para agrandar la pieza"],
  ["Disminución (dis)","Unir 2 puntos en uno para achicar la pieza"],
  ["Vuelta (v)","Una ronda completa alrededor de la pieza"],
  ["Punto raso (prs)","Punto muy corto para unir o cerrar"],
];

const ABBR_ADVANCED = [
  ["ap","anillo mágico"],["pm","punto(s) medio(s)"],["aum","aumento (2pm en 1 punto)"],
  ["dis","disminución invisible"],["pb","punto bajo"],["pa","punto alto"],
  ["prs","punto raso"],["v","vuelta"],["rep","repetir"],["×","número de veces"],
];

export default function AmigurumiApp() {
  const [level,      setLevel]      = useState(null);
  const [image,      setImage]      = useState(null);
  const [imgB64,     setImgB64]     = useState(null);
  const [size,       setSize]       = useState(SIZES[1]);
  const [loading,    setLoading]    = useState(false);
  const [loadMsg,    setLoadMsg]    = useState("");
  const [pattern,    setPattern]    = useState(null);
  const [error,      setError]      = useState(null);
  const [tab,        setTab]        = useState("upload");
  const [checked,    setChecked]    = useState({});
  const [showAbbr,   setShowAbbr]   = useState(false);
  const [printView,  setPrintView]  = useState(false);
  const fileRef = useRef();

  const currentLevel = LEVELS.find(l => l.id === level) || LEVELS[2];

  const loadFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImage(ev.target.result);
      setImgB64(ev.target.result.split(",")[1]);
      setPattern(null); setError(null); setChecked({});
    };
    reader.readAsDataURL(file);
  };

  const buildPrompt = () => {
    const { magic, hook } = size;

    if (level === "beginner") {
      return `Eres una profesora de crochet muy paciente y amable. Analiza la imagen y genera un patrón de amigurumi MUY SENCILLO para alguien que nunca ha tejido.

Proyecto: Tamaño ${size.label}, gancho ${hook}, anillo mágico base ${magic} puntos.

REGLAS IMPORTANTES para principiantes:
- Usa palabras simples, NADA de abreviaturas técnicas
- Escribe cada instrucción de forma muy clara: "Haz 2 puntos en el mismo hueco" en vez de "aum"
- Incluye explicaciones de por qué se hace cada cosa
- Máximo 3-4 colores, formas simples y redondeadas
- Cada vuelta explicada como si fuera la primera vez
- Incluye consejos de motivación y tips visuales
- Las partes deben ser pocas y simples (máximo 5 partes)

Responde SOLO con JSON (sin backticks):
{"nombre":"...","descripcion":"...","dificultad":"Principiante","tiempoEstimado":"X-Y horas","nivelMensaje":"¡Tú puedes hacerlo! Este patrón es perfecto para comenzar.","materiales":["..."],"partes":[{"nombre":"...","color":"...","puntoInicial":"Haz un anillo mágico con ${magic} puntos","vueltas":[{"num":1,"instruccion":"Haz ${magic} puntos medios dentro del anillo mágico","total":${magic},"explicacion":"Esto forma la base de tu pieza"}],"notas":"..."}],"ensamblaje":["..."],"consejosFinales":["..."]}`;
    }

    if (level === "intermediate") {
      return `Eres experta en amigurumis. Analiza la imagen y genera un patrón de amigurumi de dificultad INTERMEDIA.

Proyecto: Tamaño ${size.label}, gancho ${hook}, anillo mágico base ${magic} puntos.

REGLAS para nivel intermedio:
- Usa abreviaturas básicas con su significado entre paréntesis la primera vez: pm (punto medio), aum (aumento), dis (disminución)
- Instrucciones claras pero concisas
- Puedes incluir algunas técnicas intermedias como cambio de color o relleno parcial
- Hasta 6 partes, formas moderadamente detalladas
- Incluye notas útiles y consejos prácticos

Responde SOLO con JSON (sin backticks):
{"nombre":"...","descripcion":"...","dificultad":"Intermedio","tiempoEstimado":"X-Y horas","nivelMensaje":"¡Buen momento para subir de nivel con este patrón!","materiales":["..."],"partes":[{"nombre":"...","color":"...","puntoInicial":"Anillo mágico con ${magic} pm","vueltas":[{"num":1,"instruccion":"${magic} pm en anillo mágico","total":${magic},"explicacion":""}],"notas":"..."}],"ensamblaje":["..."],"consejosFinales":["..."]}`;
    }

    // advanced
    return `Eres diseñadora experta en amigurumis con 10+ años de experiencia. Analiza la imagen y genera un patrón COMPLETO y DETALLADO nivel avanzado.

Proyecto: Tamaño ${size.label}, gancho ${hook}, anillo mágico base ${magic} puntos.

Usa terminología técnica española: pm, aum, dis, ap, prs, v. Trabaja en espiral.
Incluye TODAS las partes (cabeza, cuerpo, extremidades, orejas, cola, detalles).
Vueltas completamente detalladas, cambios de color, técnicas avanzadas.

Responde SOLO con JSON (sin backticks):
{"nombre":"...","descripcion":"...","dificultad":"Avanzado","tiempoEstimado":"X-Y horas","nivelMensaje":"Patrón técnico completo para tejedoras expertas.","materiales":["..."],"partes":[{"nombre":"...","color":"...","puntoInicial":"ap con ${magic} pm","vueltas":[{"num":1,"instruccion":"ap con ${magic} pm","total":${magic},"explicacion":""}],"notas":"..."}],"ensamblaje":["..."],"consejosFinales":["..."]}`;
  };

  const generate = async () => {
    if (!imgB64 || !level) return;
    setLoading(true); setError(null); setPattern(null); setChecked({});
    setLoadMsg("Analizando la imagen…");
    try {
      setLoadMsg("La IA está diseñando tu patrón…");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{
          "Content-Type":"application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:8000,
          messages:[{role:"user", content:[
            {type:"image", source:{type:"base64", media_type:"image/jpeg", data:imgB64}},
            {type:"text", text:buildPrompt()}
          ]}]
        })
      });
      setLoadMsg("Estructurando el patrón…");
      const data = await res.json();
      const text = (data.content||[]).map(b=>b.text||"").join("");
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("sin JSON");
      const parsed = JSON.parse(match[0]);
      if (!parsed.partes?.length) throw new Error("vacío");
      setPattern(parsed);
      setTab("pattern");
    } catch(e) {
      setError("No se pudo generar el patrón. Intenta con otra imagen más clara.");
    } finally { setLoading(false); setLoadMsg(""); }
  };

  const toggleRow = (pi, rn) => {
    const k = `${pi}-${rn}`;
    setChecked(prev => ({...prev, [k]: !prev[k]}));
  };

  const copyText = () => {
    if (!pattern) return;
    let t = `PATRÓN AMIGURUMI: ${pattern.nombre}\n${"─".repeat(40)}\n`;
    t += `Nivel: ${pattern.dificultad} | Tamaño: ${size.label} | Tiempo: ${pattern.tiempoEstimado}\n\n`;
    t += `MATERIALES:\n${pattern.materiales.map(m=>`• ${m}`).join("\n")}\n`;
    pattern.partes.forEach(p => {
      t += `\n${"═".repeat(40)}\n◆ ${p.nombre.toUpperCase()} (${p.color})\nInicio: ${p.puntoInicial}\n\n`;
      p.vueltas.forEach(v => {
        t += `Vuelta ${v.num}: ${v.instruccion} [${v.total} puntos]\n`;
        if (v.explicacion) t += `  → ${v.explicacion}\n`;
      });
      if (p.notas) t += `\nNota: ${p.notas}\n`;
    });
    t += `\nENSAMBLAJE:\n${pattern.ensamblaje.map((s,i)=>`${i+1}. ${s}`).join("\n")}`;
    t += `\n\nCONSEJOS:\n${(pattern.consejosFinales||[]).map(c=>`• ${c}`).join("\n")}`;
    navigator.clipboard.writeText(t).then(
      () => alert("✅ Patrón copiado. Pégalo en WhatsApp, notas o Google Docs."),
      () => alert("No se pudo copiar automáticamente.")
    );
  };

  const totalRows = pattern?.partes?.reduce((a,p) => a + p.vueltas.length, 0) || 0;
  const doneRows  = Object.values(checked).filter(Boolean).length;
  const progress  = totalRows > 0 ? Math.round((doneRows/totalRows)*100) : 0;
  const lv = currentLevel;
  const abbr = level === "advanced" ? ABBR_ADVANCED : ABBR_BEGINNER;

  /* ═══ LEVEL SELECTOR ════════════════════════════════════════════════════ */
  if (!level) {
    return (
      <div style={{minHeight:"100vh", background:"linear-gradient(160deg,#fdf4ff 0%,#f0fdf4 100%)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, fontFamily:"Georgia,serif"}}>
        <div style={{fontSize:52, marginBottom:12}}>🧸</div>
        <h1 style={{fontSize:26, fontWeight:"bold", color:"#2d1b3d", marginBottom:6, textAlign:"center"}}>AmigoPatrón IA</h1>
        <p style={{fontSize:14, color:"#6b5080", marginBottom:36, textAlign:"center", maxWidth:320}}>
          Genera patrones de amigurumi desde una foto. Primero dinos tu nivel:
        </p>
        <div style={{display:"flex", flexDirection:"column", gap:14, width:"100%", maxWidth:360}}>
          {LEVELS.map(l => (
            <button key={l.id} onClick={()=>setLevel(l.id)} style={{
              padding:"18px 20px", borderRadius:16, border:`2px solid ${l.border}`,
              background:l.bg, cursor:"pointer", textAlign:"left",
              boxShadow:"0 2px 12px rgba(0,0,0,0.07)", transition:"all 0.2s",
            }}>
              <div style={{display:"flex", alignItems:"center", gap:12}}>
                <span style={{fontSize:32}}>{l.emoji}</span>
                <div>
                  <div style={{fontSize:16, fontWeight:"bold", color:l.color}}>{l.label}</div>
                  <div style={{fontSize:12, color:"#6b5080", marginTop:2}}>{l.desc}</div>
                </div>
                <span style={{marginLeft:"auto", fontSize:20, color:l.color}}>→</span>
              </div>
            </button>
          ))}
        </div>
        <p style={{fontSize:11, color:"#a89bb0", marginTop:24, textAlign:"center"}}>Puedes cambiar el nivel en cualquier momento</p>
      </div>
    );
  }

  /* ═══ PRINT VIEW ════════════════════════════════════════════════════════ */
  if (printView && pattern) {
    return (
      <div style={{minHeight:"100vh", background:"#fff", fontFamily:"Georgia,serif"}}>
        <div style={{background:lv.headerBg, padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:10, boxShadow:"0 2px 12px rgba(0,0,0,0.3)"}}>
          <span style={{color:"#fff", fontWeight:"bold", fontSize:14}}>📄 Vista para imprimir</span>
          <div style={{display:"flex", gap:8}}>
            <button onClick={copyText} style={{background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12}}>📋 Copiar</button>
            <button onClick={()=>setPrintView(false)} style={{background:"rgba(255,255,255,0.9)", border:"none", color:lv.color, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, fontWeight:"bold"}}>← Volver</button>
          </div>
        </div>
        <div style={{background:"#fef9c3", borderBottom:"1px solid #fde047", padding:"10px 16px", fontSize:12, color:"#713f12"}}>
          💡 <strong>Para guardar como PDF:</strong> En el navegador toca ⋮ → <em>Imprimir</em> → <em>Guardar como PDF</em>. O toca <strong>Copiar</strong> y pégalo en Google Docs.
        </div>
        <div style={{padding:"16px", maxWidth:680, margin:"0 auto"}}>

          <div style={{background:lv.headerBg, color:"#fff", borderRadius:12, padding:"16px 18px", marginBottom:16}}>
            <div style={{fontSize:20, fontWeight:"bold", marginBottom:4}}>🧸 {pattern.nombre}</div>
            <div style={{fontSize:12, opacity:0.85, marginBottom:8}}>{pattern.descripcion}</div>
            <div style={{fontSize:11, opacity:0.75, fontStyle:"italic", marginBottom:10}}>{pattern.nivelMensaje}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {[["📏",size.label],["🔗",`Gancho ${size.hook}`],["🎯",pattern.dificultad],["⏱",pattern.tiempoEstimado]].map(([i,v])=>(
                <span key={v} style={{background:"rgba(255,255,255,0.2)", borderRadius:6, padding:"2px 9px", fontSize:10}}>{i} {v}</span>
              ))}
            </div>
          </div>

          {/* tabla de contenidos */}
          <div style={{border:`1px solid ${lv.border}`, borderRadius:12, marginBottom:16, overflow:"hidden"}}>
            <div style={{background:lv.bg, padding:"10px 14px", borderBottom:`1px solid ${lv.border}`}}>
              <div style={{fontSize:12, fontWeight:"bold", color:lv.color, textTransform:"uppercase", letterSpacing:1}}>📋 Tabla de contenidos</div>
            </div>
            <div style={{padding:"10px 14px"}}>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b5080", marginBottom:6, paddingBottom:4, borderBottom:`1px dashed ${lv.border}`}}>
                <span>📖 {level==="advanced"?"Abreviaturas":"Glosario"}</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b5080", marginBottom:6, paddingBottom:4, borderBottom:`1px dashed ${lv.border}`}}>
                <span>🪡 Materiales</span>
              </div>
              {pattern.partes.map((parte, pi) => (
                <div key={pi} style={{display:"flex", justifyContent:"space-between", alignItems:"center", fontSize:11, color:"#3a1a5e", marginBottom:5, paddingBottom:5, borderBottom:`1px dashed ${lv.border}`}}>
                  <span><strong style={{color:lv.color}}>◆ {parte.nombre}</strong> <span style={{color:"#9a8ab0"}}>({parte.color})</span></span>
                  <span style={{color:lv.color, fontWeight:"bold", whiteSpace:"nowrap", marginLeft:8}}>{parte.vueltas.length} vueltas</span>
                </div>
              ))}
              <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b5080", marginBottom:4, paddingBottom:4, borderBottom:`1px dashed ${lv.border}`}}>
                <span>🔧 {level==="beginner"?"Cómo armar":"Ensamblaje"}</span>
                <span style={{color:lv.color}}>{pattern.ensamblaje.length} pasos</span>
              </div>
              {pattern.consejosFinales?.length > 0 && (
                <div style={{display:"flex", justifyContent:"space-between", fontSize:11, color:"#6b5080"}}>
                  <span>💡 Consejos finales</span>
                  <span style={{color:lv.color}}>{pattern.consejosFinales.length} consejos</span>
                </div>
              )}
              <div style={{marginTop:10, padding:"8px 10px", background:lv.bg, borderRadius:8, fontSize:10, color:lv.color, fontWeight:"bold", textAlign:"center"}}>
                Total: {pattern.partes.reduce((a,p)=>a+p.vueltas.length,0)} vueltas en {pattern.partes.length} partes · ⏱ {pattern.tiempoEstimado}
              </div>
            </div>
          </div>

          {/* abbr */}
          <div style={PS.sec}>
            <div style={{...PS.title, color:lv.color, borderColor:lv.border}}>📖 {level==="advanced"?"Abreviaturas":"Glosario de términos"}</div>
            <div style={{display:"grid", gridTemplateColumns: level==="advanced"?"1fr 1fr":"1fr", gap:"4px 16px"}}>
              {abbr.map(([a,d])=>(
                <div key={a} style={{fontSize:11, color:"#3a1a5e", padding:"2px 0"}}>
                  <strong style={{color:lv.color}}>{a}:</strong> {d}
                </div>
              ))}
            </div>
          </div>

          {/* materiales */}
          <div style={PS.sec}>
            <div style={{...PS.title, color:lv.color, borderColor:lv.border}}>🪡 Materiales</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 16px"}}>
              {[...pattern.materiales, `Gancho ${size.hook}`, "Aguja lanera", "Relleno fibra siliconada", "Ojos de seguridad", "Marcadores de puntos"].map((m,i)=>(
                <div key={i} style={{fontSize:11, color:"#3a1a5e"}}>• {m}</div>
              ))}
            </div>
          </div>

          {/* partes */}
          {pattern.partes.map((parte, pi) => (
            <div key={pi} style={{border:`1px solid ${lv.border}`, borderRadius:10, marginBottom:14, overflow:"hidden"}}>
              <div style={{background:lv.bg, padding:"8px 12px", borderBottom:`1px solid ${lv.border}`}}>
                <div style={{fontSize:13, fontWeight:"bold", color:lv.color}}>◆ {parte.nombre.toUpperCase()}</div>
                <div style={{fontSize:10, color:"#7c3aed", marginTop:2}}>🎨 {parte.color} &nbsp;|&nbsp; Inicio: {parte.puntoInicial}</div>
              </div>
              {parte.vueltas.map(v => (
                <div key={v.num}>
                  <div style={{display:"grid", gridTemplateColumns:"auto 1fr auto", gap:6, padding:"6px 12px", borderBottom:"1px solid #f3f0ff", fontSize:11, alignItems:"start", background: v.num%2===0?"#fafafa":"#fff"}}>
                    <span style={{fontWeight:"bold", color:lv.color, whiteSpace:"nowrap"}}>
                      {level==="beginner"?`Vuelta ${v.num}:`:`V${v.num}:`}
                    </span>
                    <span style={{color:"#1a0a2e", lineHeight:1.5}}>{v.instruccion}</span>
                    <span style={{fontWeight:"bold", color:"#a855d4", textAlign:"right", whiteSpace:"nowrap"}}>[{v.total}pts]</span>
                  </div>
                  {v.explicacion && level !== "advanced" && (
                    <div style={{padding:"4px 12px 6px 12px", fontSize:10, color:"#6b5080", fontStyle:"italic", background:"#f9f5ff", borderBottom:"1px solid #f3f0ff"}}>
                      💬 {v.explicacion}
                    </div>
                  )}
                </div>
              ))}
              {parte.notas && (
                <div style={{background:"#fffbeb", padding:"6px 12px", fontSize:10, color:"#92400e", fontStyle:"italic", borderTop:`1px solid ${lv.border}`}}>
                  📌 {parte.notas}
                </div>
              )}
            </div>
          ))}

          {/* ensamblaje */}
          <div style={PS.sec}>
            <div style={{...PS.title, color:lv.color, borderColor:lv.border}}>🔧 {level==="beginner"?"Cómo armar tu amigurumi":"Ensamblaje"}</div>
            {pattern.ensamblaje.map((s,i)=>(
              <div key={i} style={{fontSize:11, color:"#3a1a5e", marginBottom:6, lineHeight:1.5}}>{i+1}. {s}</div>
            ))}
          </div>

          {/* consejos */}
          {pattern.consejosFinales?.length > 0 && (
            <div style={{background:lv.bg, border:`1px solid ${lv.border}`, borderRadius:10, padding:14, marginBottom:14}}>
              <div style={{...PS.title, color:lv.color, borderColor:lv.border}}>
                {level==="beginner"?"💪 ¡Ánimo! Consejos para lograrlo":"💡 Consejos finales"}
              </div>
              {pattern.consejosFinales.map((c,i)=>(
                <div key={i} style={{fontSize:11, color:"#3a1a5e", marginBottom:4, lineHeight:1.5}}>• {c}</div>
              ))}
            </div>
          )}

          <div style={{textAlign:"center", fontSize:10, color:"#a78bfa", padding:"12px 0", fontStyle:"italic", borderTop:"1px solid #e9d5ff", marginTop:8}}>
            AmigoPatrón IA · Nivel {pattern.dificultad} · {pattern.nombre}
          </div>
        </div>
      </div>
    );
  }

  /* ═══ MAIN APP ══════════════════════════════════════════════════════════ */
  return (
    <div style={{minHeight:"100vh", background:lv.bg, fontFamily:"Georgia,'Cambria',serif", color:"#2d1b3d"}}>

      {/* header */}
      <header style={{background:lv.headerBg, padding:"16px 20px", color:"#fff", boxShadow:"0 4px 20px rgba(0,0,0,0.25)"}}>
        <div style={{maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10}}>
          <div style={{display:"flex", alignItems:"center", gap:10}}>
            <span style={{fontSize:28}}>🧸</span>
            <div>
              <div style={{fontSize:17, fontWeight:"bold", letterSpacing:1}}>AmigoPatrón IA</div>
              <div style={{fontSize:10, opacity:0.7}}>{lv.emoji} Nivel {lv.label}</div>
            </div>
          </div>
          <div style={{display:"flex", gap:6, alignItems:"center"}}>
            {pattern && ["upload","pattern"].map(t=>(
              <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 12px", borderRadius:20, border:"none", cursor:"pointer", fontSize:11, background:tab===t?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.2)", color:tab===t?lv.color:"#fff", fontWeight:tab===t?"bold":"normal"}}>
                {t==="upload"?"📷 Imagen":"📋 Patrón"}
              </button>
            ))}
            <button onClick={()=>{setLevel(null);setPattern(null);setTab("upload");}} style={{padding:"6px 12px", borderRadius:20, border:"1px solid rgba(255,255,255,0.4)", background:"transparent", color:"#fff", fontSize:11, cursor:"pointer"}}>
              Cambiar nivel
            </button>
          </div>
        </div>
      </header>

      <div style={{maxWidth:700, margin:"0 auto", padding:"20px 16px"}}>

        {/* ── UPLOAD TAB ── */}
        {tab==="upload" && (
          <div style={{display:"flex", flexDirection:"column", gap:16}}>

            {/* welcome message for beginners */}
            {level === "beginner" && (
              <div style={{background:"#dcfce7", border:"1px solid #86efac", borderRadius:12, padding:"14px 16px"}}>
                <div style={{fontSize:14, fontWeight:"bold", color:"#15803d", marginBottom:4}}>👋 ¡Bienvenida!</div>
                <div style={{fontSize:12, color:"#166534", lineHeight:1.6}}>
                  Esta app analiza una foto y te genera instrucciones paso a paso para tejer tu amigurumi. Solo necesitas una imagen de lo que quieres hacer. ¡Es más fácil de lo que parece!
                </div>
              </div>
            )}

            {/* image upload */}
            <div style={S.card}>
              <div style={{...S.title, color:lv.color}}>
                📷 {level==="beginner"?"Foto del amigurumi que quieres tejer":"Imagen de referencia"}
              </div>
              {level==="beginner" && (
                <div style={{fontSize:11, color:"#6b5080", marginBottom:10, lineHeight:1.5}}>
                  💡 Tip: Busca una foto clara en Google de un amigurumi que te guste (un osito, gatito, etc.) y súbela aquí.
                </div>
              )}
              <div
                onDrop={e=>{e.preventDefault();loadFile(e.dataTransfer.files[0]);}}
                onDragOver={e=>e.preventDefault()}
                onClick={()=>fileRef.current?.click()}
                style={{border:`2px dashed ${image?lv.color:lv.border}`, borderRadius:12, padding:18, textAlign:"center", cursor:"pointer", background:image?"transparent":lv.bg, minHeight:image?"auto":110, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}
              >
                {image
                  ? <img src={image} alt="ref" style={{maxWidth:"100%", maxHeight:200, borderRadius:8, objectFit:"contain"}}/>
                  : <>
                      <div style={{fontSize:36, marginBottom:8, opacity:0.4}}>🖼️</div>
                      <div style={{color:lv.color, fontSize:13}}>Toca aquí para subir la foto</div>
                      <div style={{color:"#a89bb0", fontSize:11, marginTop:3}}>JPG · PNG · WEBP</div>
                    </>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>loadFile(e.target.files[0])} style={{display:"none"}}/>
              {image && <button onClick={()=>fileRef.current?.click()} style={{...S.ghost, borderColor:lv.border, color:lv.color}}>Cambiar foto</button>}
            </div>

            {/* size */}
            <div style={S.card}>
              <div style={{...S.title, color:lv.color}}>
                📏 {level==="beginner"?"¿Qué tamaño quieres?":"Tamaño del amigurumi"}
              </div>
              {level==="beginner" && (
                <div style={{fontSize:11, color:"#6b5080", marginBottom:10}}>
                  💡 Para empezar te recomendamos <strong>Pequeño (~12cm)</strong> — es más fácil de manejar.
                </div>
              )}
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                {SIZES.map(s=>(
                  <button key={s.label} onClick={()=>setSize(s)} style={{padding:"10px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", border:size.label===s.label?`2px solid ${lv.color}`:`2px solid ${lv.border}`, background:size.label===s.label?lv.bg:"#fff", transition:"all 0.15s"}}>
                    <div style={{fontSize:12, fontWeight:size.label===s.label?"bold":"normal", color:"#2d1b3d"}}>{s.label}</div>
                    <div style={{fontSize:10, color:lv.color, marginTop:2}}>Gancho {s.hook}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* abbr */}
            <div style={S.card}>
              <button onClick={()=>setShowAbbr(v=>!v)} style={{background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", padding:0}}>
                <div style={{...S.title, color:lv.color, marginBottom:0}}>{level==="advanced"?"📖 Abreviaturas":"📖 Glosario de términos"}</div>
                <span style={{color:lv.color, fontSize:16}}>{showAbbr?"▲":"▼"}</span>
              </button>
              {showAbbr && (
                <div style={{marginTop:10, display:"flex", flexDirection:"column", gap:4}}>
                  {abbr.map(([a,d])=>(
                    <div key={a} style={{fontSize:11, color:"#3a1a5e", padding:"3px 0", borderBottom:"1px solid #f3e8ff"}}>
                      <strong style={{color:lv.color}}>{a}:</strong> {d}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && <div style={{background:"#fff0f0", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", color:"#b91c1c", fontSize:13}}>⚠️ {error}</div>}

            <button onClick={generate} disabled={!image||loading} style={{padding:"16px", borderRadius:12, border:"none", cursor:!image||loading?"not-allowed":"pointer", background:!image||loading?"#e2e8f0":lv.headerBg, color:!image||loading?"#94a3b8":"#fff", fontSize:15, fontWeight:"bold", letterSpacing:0.5, boxShadow:!image||loading?"none":"0 4px 18px rgba(0,0,0,0.25)", transition:"all 0.25s"}}>
              {loading ? `⏳ ${loadMsg}` : level==="beginner" ? "✨ ¡Crear mi patrón!" : "✨ Generar Patrón de Amigurumi"}
            </button>
          </div>
        )}

        {/* ── PATTERN TAB ── */}
        {tab==="pattern" && (
          <div style={{display:"flex", flexDirection:"column", gap:14}}>
            {!pattern ? (
              <div style={{textAlign:"center", padding:70, color:"#9a8070"}}>
                <div style={{fontSize:48, marginBottom:14, opacity:0.3}}>🪡</div>
                <div style={{marginBottom:14}}>Genera un patrón primero</div>
                <button onClick={()=>setTab("upload")} style={{...S.ghost, width:"auto", display:"inline-block", padding:"10px 24px", borderColor:lv.border, color:lv.color}}>Ir a configurar</button>
              </div>
            ) : (
              <>
                {/* info */}
                <div style={{background:lv.headerBg, color:"#fff", borderRadius:14, padding:"16px 18px"}}>
                  <div style={{fontSize:20, fontWeight:"bold", marginBottom:4}}>🧸 {pattern.nombre}</div>
                  <div style={{fontSize:12, opacity:0.85, marginBottom:6}}>{pattern.descripcion}</div>
                  {pattern.nivelMensaje && <div style={{fontSize:11, opacity:0.75, fontStyle:"italic", marginBottom:10}}>✨ {pattern.nivelMensaje}</div>}
                  <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                    {[["📏",size.label],["🔗",`Gancho ${size.hook}`],["🎯",pattern.dificultad],["⏱",pattern.tiempoEstimado]].map(([i,v])=>(
                      <span key={v} style={{background:"rgba(255,255,255,0.2)", borderRadius:6, padding:"2px 9px", fontSize:10}}>{i} {v}</span>
                    ))}
                  </div>
                </div>

                {/* progress */}
                {totalRows > 0 && (
                  <div style={S.card}>
                    <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}>
                      <span style={{fontSize:12, fontWeight:"bold", color:lv.color}}>
                        {level==="beginner"?"Tu progreso 🌟":"Progreso"}
                      </span>
                      <span style={{fontSize:12, color:lv.color}}>{doneRows}/{totalRows} vueltas · {progress}%</span>
                    </div>
                    <div style={{height:10, background:"#e2e8f0", borderRadius:5, overflow:"hidden"}}>
                      <div style={{height:"100%", width:`${progress}%`, background:lv.headerBg, borderRadius:5, transition:"width 0.3s"}}/>
                    </div>
                    {level==="beginner" && progress===100 && (
                      <div style={{marginTop:8, textAlign:"center", fontSize:13, color:"#15803d", fontWeight:"bold"}}>🎉 ¡Felicidades! ¡Completaste todas las vueltas!</div>
                    )}
                  </div>
                )}

                {/* partes */}
                {pattern.partes.map((parte, pi) => {
                  const done = parte.vueltas.filter(v=>checked[`${pi}-${v.num}`]).length;
                  return (
                    <div key={pi} style={{...S.card, borderLeft:`4px solid ${lv.color}`}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                        <div>
                          <div style={{fontSize:15, fontWeight:"bold", color:lv.color}}>◆ {parte.nombre}</div>
                          <div style={{fontSize:11, color:"#6b5080", marginTop:2}}>🎨 {parte.color} · Inicio: {parte.puntoInicial}</div>
                        </div>
                        <div style={{fontSize:11, color:lv.color, textAlign:"right"}}>{done}/{parte.vueltas.length}<br/>vueltas</div>
                      </div>
                      <div style={{display:"flex", flexDirection:"column", gap:3}}>
                        {parte.vueltas.map(v => {
                          const k = `${pi}-${v.num}`;
                          const isDone = !!checked[k];
                          return (
                            <div key={v.num}>
                              <div onClick={()=>toggleRow(pi,v.num)} style={{display:"flex", alignItems:"flex-start", gap:8, padding:"8px 10px", borderRadius:8, cursor:"pointer", background:isDone?"#f0fdf4":"#fff", border:isDone?"1px solid #86efac":`1px solid ${lv.border}`, userSelect:"none"}}>
                                <div style={{width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1, border:isDone?"none":`2px solid ${lv.color}`, background:isDone?"#22c55e":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff"}}>
                                  {isDone?"✓":""}
                                </div>
                                <div style={{flex:1}}>
                                  <span style={{fontWeight:"bold", color:isDone?"#15803d":lv.color, fontSize:12, marginRight:5}}>
                                    {level==="beginner"?`Vuelta ${v.num}:`:`V${v.num}:`}
                                  </span>
                                  <span style={{fontSize:12, color:isDone?"#166534":"#2d1b3d", textDecoration:isDone?"line-through":"none", opacity:isDone?0.7:1}}>{v.instruccion}</span>
                                </div>
                                <span style={{fontSize:11, color:isDone?"#15803d":lv.color, fontWeight:"bold", flexShrink:0}}>[{v.total}pts]</span>
                              </div>
                              {v.explicacion && level!=="advanced" && !isDone && (
                                <div style={{padding:"4px 12px 6px 38px", fontSize:10, color:"#6b5080", fontStyle:"italic"}}>
                                  💬 {v.explicacion}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      {parte.notas && (
                        <div style={{marginTop:10, padding:"7px 12px", background:"#fffbeb", borderRadius:8, border:"1px solid #fde68a", fontSize:11, color:"#92400e"}}>
                          📌 {parte.notas}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ensamblaje */}
                <div style={S.card}>
                  <div style={{...S.title, color:lv.color}}>{level==="beginner"?"🔧 Cómo armar tu amigurumi":"🔧 Ensamblaje"}</div>
                  <ol style={{margin:0, padding:"0 0 0 18px"}}>
                    {pattern.ensamblaje.map((s,i)=>(
                      <li key={i} style={{fontSize:12, color:"#4a1d6e", marginBottom:6, lineHeight:1.6}}>{s}</li>
                    ))}
                  </ol>
                </div>

                {/* consejos */}
                {pattern.consejosFinales?.length > 0 && (
                  <div style={{...S.card, background:lv.bg, border:`1px solid ${lv.border}`}}>
                    <div style={{...S.title, color:lv.color}}>{level==="beginner"?"💪 ¡Tú puedes! Consejos":"💡 Consejos finales"}</div>
                    <ul style={{margin:0, padding:"0 0 0 16px"}}>
                      {pattern.consejosFinales.map((c,i)=>(
                        <li key={i} style={{fontSize:12, color:"#4a1d6e", marginBottom:5, lineHeight:1.6}}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* export */}
                <div style={{...S.card, background:"#1e1030", border:"1px solid #4a2080"}}>
                  <div style={{fontSize:13, fontWeight:"bold", color:"#e9d5ff", marginBottom:10}}>⬇️ Guardar patrón</div>
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    <button onClick={()=>setPrintView(true)} style={{padding:"13px 16px", borderRadius:10, border:"none", background:lv.headerBg, color:"#fff", fontWeight:"bold", fontSize:13, cursor:"pointer", textAlign:"left"}}>
                      📄 Ver patrón completo para imprimir
                      <div style={{fontSize:10, fontWeight:"normal", opacity:0.8, marginTop:2}}>Desde el navegador → Imprimir → Guardar como PDF</div>
                    </button>
                    <button onClick={copyText} style={{padding:"11px 16px", borderRadius:10, border:"1px solid #4a2080", background:"rgba(107,47,160,0.2)", color:"#e9d5ff", fontSize:13, cursor:"pointer", textAlign:"left"}}>
                      📋 Copiar texto plano
                      <div style={{fontSize:10, opacity:0.7, marginTop:2}}>Pega en WhatsApp, Google Docs o notas</div>
                    </button>
                  </div>
                </div>

                <button onClick={()=>{setPattern(null);setTab("upload");}} style={{...S.ghost, fontSize:13, borderColor:lv.border, color:lv.color}}>🔄 Generar nuevo patrón</button>
                <div style={{height:16}}/>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;}`}</style>
    </div>
  );
}

const S = {
  card:  { background:"#fff", borderRadius:14, border:"1px solid #e9d5ff", padding:16, boxShadow:"0 2px 10px rgba(0,0,0,0.06)" },
  title: { fontSize:13, fontWeight:"bold", marginBottom:10, paddingBottom:6, borderBottom:"1px solid #f3e8ff" },
  ghost: { width:"100%", padding:"9px 14px", borderRadius:10, cursor:"pointer", border:"1px solid #e9d5ff", background:"#fff", fontSize:13 },
};
const PS = {
  sec:   { marginBottom:16 },
  title: { fontSize:11, fontWeight:"bold", textTransform:"uppercase", letterSpacing:1, borderBottom:"2px solid #e9d5ff", paddingBottom:3, marginBottom:8 },
};
