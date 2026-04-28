import { useState, useRef } from "react";

const SIZES = [
  { label:"Mini (~8cm)",      yarn:"Hilo fino (Nº2)",     hook:"2.0–2.5mm", magic:6 },
  { label:"Pequeño (~12cm)",  yarn:"Hilo sport (Nº3)",    hook:"2.5–3.0mm", magic:6 },
  { label:"Mediano (~18cm)",  yarn:"Hilo DK (Nº4)",       hook:"3.0–3.5mm", magic:6 },
  { label:"Grande (~25cm)",   yarn:"Hilo worsted (Nº5)",  hook:"3.5–4.0mm", magic:8 },
];

const ABBR = [
  ["ap","anillo mágico"],["pm","punto(s) medio(s)"],["aum","aumento (2pm en 1 punto)"],
  ["dis","disminución invisible"],["pb","punto bajo"],["pa","punto alto"],
  ["prs","punto raso"],["v","vuelta"],["rep","repetir"],["×","número de veces"],
];

export default function AmigurumiApp() {
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

  const generate = async () => {
    if (!imgB64) return;
    setLoading(true); setError(null); setPattern(null); setChecked({});
    setLoadMsg("Analizando la imagen…");
    const prompt = `Eres diseñadora experta en amigurumis. Analiza la imagen y genera un patrón COMPLETO de amigurumi crochet nivel avanzado.

Proyecto: Tamaño ${size.label}, hilo ${size.yarn}, gancho ${size.hook}, anillo mágico base ${size.magic} puntos.

Usa terminología española: pm, aum, dis, ap, prs, v. Trabaja en espiral.
Incluye TODAS las partes (cabeza, cuerpo, extremidades, orejas, cola, detalles).
Para cada parte: nombre, inicio, vueltas detalladas con total de puntos, notas.
Incluye ensamblaje y consejos al final.

Responde SOLO con JSON (sin backticks):
{"nombre":"...","descripcion":"...","dificultad":"Avanzado","tiempoEstimado":"X-Y horas","materiales":["..."],"partes":[{"nombre":"...","color":"...","puntoInicial":"ap con ${size.magic} pm","vueltas":[{"num":1,"instruccion":"ap con ${size.magic} pm","total":${size.magic}}],"notas":"..."}],"ensamblaje":["..."],"consejosFinales":["..."]}`;

    try {
      setLoadMsg("La IA está diseñando tu patrón…");
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json","x-api-key":import.meta.env.VITE_ANTHROPIC_API_KEY,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},
        body:JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:8000,
          messages:[{role:"user", content:[
            {type:"image", source:{type:"base64", media_type:"image/jpeg", data:imgB64}},
            {type:"text", text:prompt}
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
    t += `Tamaño: ${size.label} | Gancho: ${size.hook} | Tiempo: ${pattern.tiempoEstimado}\n\n`;
    t += `MATERIALES:\n${pattern.materiales.map(m=>`• ${m}`).join("\n")}\n`;
    pattern.partes.forEach(p => {
      t += `\n${"═".repeat(40)}\n◆ ${p.nombre.toUpperCase()} (${p.color})\nInicio: ${p.puntoInicial}\n\n`;
      p.vueltas.forEach(v => { t += `V${v.num}: ${v.instruccion} [${v.total}pm]\n`; });
      if (p.notas) t += `\nNota: ${p.notas}\n`;
    });
    t += `\nENSAMBLAJE:\n${pattern.ensamblaje.map((s,i)=>`${i+1}. ${s}`).join("\n")}`;
    t += `\n\nCONSEJOS:\n${(pattern.consejosFinales||[]).map(c=>`• ${c}`).join("\n")}`;
    navigator.clipboard.writeText(t).then(
      () => alert("✅ Patrón copiado. Pégalo en WhatsApp, notas o Google Docs."),
      () => alert("No se pudo copiar automáticamente.")
    );
  };

  /* ── Build printable HTML ── */
  const buildPrintHTML = () => {
    if (!pattern) return "";
    const mats = [...pattern.materiales, `Gancho ${size.hook}`, "Aguja lanera", "Relleno de fibra siliconada", "Ojos de seguridad", "Marcadores de puntos"];
    return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Patrón - ${pattern.nombre}</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;}
body{font-family:Georgia,serif;font-size:12px;color:#1a0a2e;padding:16px;max-width:700px;margin:0 auto;}
h1{font-size:20px;color:#6b2fa0;margin-bottom:4px;}
.sub{font-size:12px;color:#9333ea;margin-bottom:12px;}
.badges{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
.badge{background:#ede9fe;border-radius:6px;padding:3px 10px;font-size:10px;color:#5b21b6;}
.sec{margin-bottom:18px;}
.sec-title{font-size:12px;font-weight:bold;color:#6b2fa0;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e9d5ff;padding-bottom:3px;margin-bottom:10px;}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:3px 16px;}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px 12px;}
.item{font-size:10px;color:#3a1a5e;padding:1px 0;}
.item b{color:#7c3aed;}
.parte{border:1px solid #e9d5ff;border-radius:8px;margin-bottom:14px;overflow:hidden;page-break-inside:avoid;}
.ph{background:#ede9fe;padding:8px 12px;border-bottom:1px solid #ddd6fe;}
.ph h3{font-size:13px;color:#5b21b6;}
.ph p{font-size:10px;color:#7c3aed;margin-top:2px;}
.vr{display:grid;grid-template-columns:38px 1fr 52px;gap:4px;padding:5px 12px;border-bottom:1px solid #f3f0ff;font-size:11px;align-items:start;}
.vr:nth-child(even){background:#faf5ff;}
.vr:last-child{border-bottom:none;}
.vn{font-weight:bold;color:#7c3aed;}
.vt{font-weight:bold;color:#a855d4;text-align:right;}
.nota{background:#fffbeb;padding:6px 12px;font-size:10px;color:#92400e;font-style:italic;border-top:1px solid #fde68a;}
.ei{font-size:11px;color:#3a1a5e;margin-bottom:6px;line-height:1.5;}
.ci{font-size:11px;color:#3a1a5e;margin-bottom:4px;line-height:1.5;}
.footer{text-align:center;font-size:9px;color:#a78bfa;padding-top:12px;border-top:1px solid #e9d5ff;margin-top:16px;font-style:italic;}
@media print{body{padding:8px;}.parte{page-break-inside:avoid;}}
</style></head><body>
<h1>🧸 ${pattern.nombre}</h1>
<div class="sub">${pattern.descripcion}</div>
<div class="badges">
  <span class="badge">📏 ${size.label}</span>
  <span class="badge">🔗 ${size.hook}</span>
  <span class="badge">🎯 ${pattern.dificultad}</span>
  <span class="badge">⏱ ${pattern.tiempoEstimado}</span>
</div>

<div class="sec">
  <div class="sec-title">📖 Abreviaturas</div>
  <div class="grid3">${ABBR.map(([a,d])=>`<div class="item"><b>${a}:</b> ${d}</div>`).join("")}</div>
</div>

<div class="sec">
  <div class="sec-title">🪡 Materiales</div>
  <div class="grid2">${mats.map(m=>`<div class="item">• ${m}</div>`).join("")}</div>
</div>

${pattern.partes.map(p=>`
<div class="parte">
  <div class="ph"><h3>◆ ${p.nombre.toUpperCase()}</h3><p>🎨 ${p.color} &nbsp;|&nbsp; Inicio: ${p.puntoInicial}</p></div>
  ${p.vueltas.map(v=>`<div class="vr"><span class="vn">V${v.num}:</span><span>${v.instruccion}</span><span class="vt">[${v.total}pm]</span></div>`).join("")}
  ${p.notas?`<div class="nota">📌 ${p.notas}</div>`:""}
</div>`).join("")}

<div class="sec">
  <div class="sec-title">🔧 Ensamblaje</div>
  ${pattern.ensamblaje.map((s,i)=>`<div class="ei">${i+1}. ${s}</div>`).join("")}
</div>

${(pattern.consejosFinales||[]).length?`
<div class="sec">
  <div class="sec-title">💡 Consejos finales</div>
  ${pattern.consejosFinales.map(c=>`<div class="ci">• ${c}</div>`).join("")}
</div>`:""}

<div class="footer">AmigoPatrón IA • ${pattern.nombre} • Patrón generado con inteligencia artificial</div>
</body></html>`;
  };

  /* ── totals ── */
  const totalRows = pattern?.partes?.reduce((a,p) => a + p.vueltas.length, 0) || 0;
  const doneRows  = Object.values(checked).filter(Boolean).length;
  const progress  = totalRows > 0 ? Math.round((doneRows/totalRows)*100) : 0;

  /* ═══ PRINT VIEW ═══════════════════════════════════════════════════════ */
  if (printView && pattern) {
    return (
      <div style={{minHeight:"100vh", background:"#fdf4ff", fontFamily:"Georgia,serif"}}>
        <div style={{
          background:"linear-gradient(135deg,#6b2fa0,#d946a8)",
          padding:"12px 16px", display:"flex", alignItems:"center",
          justifyContent:"space-between", position:"sticky", top:0, zIndex:10,
          boxShadow:"0 2px 12px rgba(107,47,160,0.4)"
        }}>
          <span style={{color:"#fff", fontWeight:"bold", fontSize:15}}>📄 Vista de impresión</span>
          <div style={{display:"flex", gap:8}}>
            <button onClick={copyText} style={{background:"rgba(255,255,255,0.2)", border:"none", color:"#fff", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12}}>
              📋 Copiar texto
            </button>
            <button onClick={()=>setPrintView(false)} style={{background:"rgba(255,255,255,0.9)", border:"none", color:"#6b2fa0", borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, fontWeight:"bold"}}>
              ← Volver
            </button>
          </div>
        </div>

        {/* tip banner */}
        <div style={{background:"#fef9c3", borderBottom:"1px solid #fde047", padding:"10px 16px", fontSize:12, color:"#713f12", display:"flex", alignItems:"center", gap:8}}>
          <span style={{fontSize:18}}>💡</span>
          <span><strong>Para guardar como PDF:</strong> En el navegador toca ⋮ → <em>Imprimir</em> → <em>Guardar como PDF</em>. O toca <strong>Copiar texto</strong> y pégalo en Google Docs.</span>
        </div>

        {/* pattern content */}
        <div style={{padding:"16px", maxWidth:680, margin:"0 auto"}}>

          {/* header */}
          <div style={{background:"linear-gradient(135deg,#6b2fa0,#d946a8)", color:"#fff", borderRadius:12, padding:"16px 18px", marginBottom:16}}>
            <div style={{fontSize:20, fontWeight:"bold", marginBottom:4}}>🧸 {pattern.nombre}</div>
            <div style={{fontSize:12, opacity:0.85, marginBottom:10}}>{pattern.descripcion}</div>
            <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
              {[["📏",size.label],["🔗",`Gancho ${size.hook}`],["🎯",pattern.dificultad],["⏱",pattern.tiempoEstimado]].map(([i,v])=>(
                <span key={v} style={{background:"rgba(255,255,255,0.2)", borderRadius:6, padding:"2px 9px", fontSize:10}}>{i} {v}</span>
              ))}
            </div>
          </div>

          {/* abreviaturas */}
          <div style={PS.sec}>
            <div style={PS.title}>📖 Abreviaturas</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 16px"}}>
              {ABBR.map(([a,d])=>(
                <div key={a} style={{fontSize:11, color:"#3a1a5e"}}><strong style={{color:"#7c3aed"}}>{a}:</strong> {d}</div>
              ))}
            </div>
          </div>

          {/* materiales */}
          <div style={PS.sec}>
            <div style={PS.title}>🪡 Materiales</div>
            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 16px"}}>
              {[...pattern.materiales, `Gancho ${size.hook}`, "Aguja lanera", "Relleno fibra siliconada", "Ojos de seguridad", "Marcadores de puntos"].map((m,i)=>(
                <div key={i} style={{fontSize:11, color:"#3a1a5e"}}>• {m}</div>
              ))}
            </div>
          </div>

          {/* partes */}
          {pattern.partes.map((parte, pi) => (
            <div key={pi} style={{border:"1px solid #e9d5ff", borderRadius:10, marginBottom:14, overflow:"hidden"}}>
              <div style={{background:"#ede9fe", padding:"8px 12px", borderBottom:"1px solid #ddd6fe"}}>
                <div style={{fontSize:13, fontWeight:"bold", color:"#5b21b6"}}>◆ {parte.nombre.toUpperCase()}</div>
                <div style={{fontSize:10, color:"#7c3aed", marginTop:2}}>🎨 {parte.color} &nbsp;|&nbsp; Inicio: {parte.puntoInicial}</div>
              </div>
              {parte.vueltas.map(v => (
                <div key={v.num} style={{
                  display:"grid", gridTemplateColumns:"38px 1fr 54px", gap:4,
                  padding:"5px 12px", borderBottom:"1px solid #f3f0ff", fontSize:11, alignItems:"start",
                  background: v.num%2===0 ? "#faf5ff" : "#fff"
                }}>
                  <span style={{fontWeight:"bold", color:"#7c3aed"}}>V{v.num}:</span>
                  <span style={{color:"#1a0a2e", lineHeight:1.4}}>{v.instruccion}</span>
                  <span style={{fontWeight:"bold", color:"#a855d4", textAlign:"right"}}>[{v.total}pm]</span>
                </div>
              ))}
              {parte.notas && (
                <div style={{background:"#fffbeb", padding:"6px 12px", fontSize:10, color:"#92400e", fontStyle:"italic", borderTop:"1px solid #fde68a"}}>
                  📌 {parte.notas}
                </div>
              )}
            </div>
          ))}

          {/* ensamblaje */}
          <div style={PS.sec}>
            <div style={PS.title}>🔧 Ensamblaje</div>
            {pattern.ensamblaje.map((s,i) => (
              <div key={i} style={{fontSize:11, color:"#3a1a5e", marginBottom:6, lineHeight:1.5}}>{i+1}. {s}</div>
            ))}
          </div>

          {/* consejos */}
          {pattern.consejosFinales?.length > 0 && (
            <div style={{...PS.sec, background:"#f5f0ff", borderRadius:10, padding:14}}>
              <div style={PS.title}>💡 Consejos finales</div>
              {pattern.consejosFinales.map((c,i) => (
                <div key={i} style={{fontSize:11, color:"#3a1a5e", marginBottom:4, lineHeight:1.5}}>• {c}</div>
              ))}
            </div>
          )}

          <div style={{textAlign:"center", fontSize:10, color:"#a78bfa", padding:"12px 0", fontStyle:"italic", borderTop:"1px solid #e9d5ff", marginTop:16}}>
            AmigoPatrón IA · {pattern.nombre} · Generado con inteligencia artificial
          </div>
        </div>
      </div>
    );
  }

  /* ═══ MAIN APP ══════════════════════════════════════════════════════════ */
  return (
    <div style={{minHeight:"100vh", background:"#fdf4ff", fontFamily:"'Georgia','Cambria',serif", color:"#2d1b3d"}}>

      {/* header */}
      <header style={{background:"linear-gradient(135deg,#6b2fa0 0%,#a855d4 50%,#d946a8 100%)", padding:"18px 22px", color:"#fff", boxShadow:"0 4px 24px rgba(107,47,160,0.4)"}}>
        <div style={{maxWidth:700, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10}}>
          <div style={{display:"flex", alignItems:"center", gap:12}}>
            <span style={{fontSize:30}}>🧸</span>
            <div>
              <div style={{fontSize:18, fontWeight:"bold", letterSpacing:1}}>AmigoPatrón IA</div>
              <div style={{fontSize:10, opacity:0.7, letterSpacing:1}}>Patrones de amigurumi desde una imagen</div>
            </div>
          </div>
          {pattern && (
            <div style={{display:"flex", gap:6}}>
              {["upload","pattern"].map(t=>(
                <button key={t} onClick={()=>setTab(t)} style={{padding:"6px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:12, background:tab===t?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.2)", color:tab===t?"#6b2fa0":"#fff", fontWeight:tab===t?"bold":"normal"}}>
                  {t==="upload"?"📷 Imagen":"📋 Patrón"}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div style={{maxWidth:700, margin:"0 auto", padding:"22px 16px"}}>

        {/* ── UPLOAD TAB ── */}
        {tab==="upload" && (
          <div style={{display:"flex", flexDirection:"column", gap:18}}>

            <div style={S.card}>
              <div style={S.title}>📷 Imagen de referencia</div>
              <div
                onDrop={e=>{e.preventDefault();loadFile(e.dataTransfer.files[0]);}}
                onDragOver={e=>e.preventDefault()}
                onClick={()=>fileRef.current?.click()}
                style={{border:`2px dashed ${image?"#a855d4":"#d8b4fe"}`, borderRadius:12, padding:18, textAlign:"center", cursor:"pointer", background:image?"transparent":"#faf5ff", minHeight:image?"auto":110, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column"}}
              >
                {image
                  ? <img src={image} alt="ref" style={{maxWidth:"100%", maxHeight:200, borderRadius:8, objectFit:"contain"}}/>
                  : <><div style={{fontSize:36, marginBottom:8, opacity:0.4}}>🖼️</div><div style={{color:"#7c3aed", fontSize:13}}>Sube una foto del amigurumi que quieres tejer</div><div style={{color:"#c4b5fd", fontSize:11, marginTop:3}}>JPG · PNG · WEBP</div></>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={e=>loadFile(e.target.files[0])} style={{display:"none"}}/>
              {image && <button onClick={()=>fileRef.current?.click()} style={S.ghost}>Cambiar imagen</button>}
            </div>

            <div style={S.card}>
              <div style={S.title}>📏 Tamaño</div>
              <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:8}}>
                {SIZES.map(s=>(
                  <button key={s.label} onClick={()=>setSize(s)} style={{padding:"10px 12px", borderRadius:10, cursor:"pointer", textAlign:"left", border:size.label===s.label?"2px solid #a855d4":"2px solid #e9d5ff", background:size.label===s.label?"#f5f0ff":"#fff", transition:"all 0.15s"}}>
                    <div style={{fontSize:12, fontWeight:size.label===s.label?"bold":"normal", color:"#2d1b3d"}}>{s.label}</div>
                    <div style={{fontSize:10, color:"#9333ea", marginTop:2}}>Gancho {s.hook}</div>
                  </button>
                ))}
              </div>
            </div>

            <div style={S.card}>
              <button onClick={()=>setShowAbbr(v=>!v)} style={{background:"none", border:"none", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", width:"100%", padding:0}}>
                <div style={S.title}>📖 Abreviaturas</div>
                <span style={{color:"#9333ea", fontSize:16}}>{showAbbr?"▲":"▼"}</span>
              </button>
              {showAbbr && (
                <div style={{marginTop:8, display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3px 14px"}}>
                  {ABBR.map(([a,d])=>(
                    <div key={a} style={{fontSize:11, color:"#3a1a5e"}}><strong style={{color:"#7c3aed"}}>{a}:</strong> {d}</div>
                  ))}
                </div>
              )}
            </div>

            {error && <div style={{background:"#fff0f0", border:"1px solid #fca5a5", borderRadius:10, padding:"12px 16px", color:"#b91c1c", fontSize:13}}>⚠️ {error}</div>}

            <button onClick={generate} disabled={!image||loading} style={{padding:"16px", borderRadius:12, border:"none", cursor:!image||loading?"not-allowed":"pointer", background:!image||loading?"#e9d5ff":"linear-gradient(135deg,#7c3aed,#d946a8)", color:!image||loading?"#a78bfa":"#fff", fontSize:15, fontWeight:"bold", letterSpacing:0.5, boxShadow:!image||loading?"none":"0 4px 18px rgba(124,58,237,0.4)", transition:"all 0.25s"}}>
              {loading ? <span>⏳ {loadMsg}</span> : "✨ Generar Patrón de Amigurumi"}
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
                <button onClick={()=>setTab("upload")} style={{...S.ghost, width:"auto", display:"inline-block", padding:"10px 24px"}}>Ir a configurar</button>
              </div>
            ) : (
              <>
                {/* info card */}
                <div style={{background:"linear-gradient(135deg,#7c3aed,#d946a8)", color:"#fff", borderRadius:14, padding:"16px 18px"}}>
                  <div style={{fontSize:20, fontWeight:"bold", marginBottom:4}}>🧸 {pattern.nombre}</div>
                  <div style={{fontSize:12, opacity:0.85, marginBottom:10}}>{pattern.descripcion}</div>
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
                      <span style={{fontSize:12, fontWeight:"bold", color:"#7c3aed"}}>Progreso</span>
                      <span style={{fontSize:12, color:"#9333ea"}}>{doneRows}/{totalRows} vueltas · {progress}%</span>
                    </div>
                    <div style={{height:8, background:"#e9d5ff", borderRadius:4, overflow:"hidden"}}>
                      <div style={{height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#7c3aed,#d946a8)", borderRadius:4, transition:"width 0.3s"}}/>
                    </div>
                  </div>
                )}

                {/* partes interactivas */}
                {pattern.partes.map((parte, pi) => {
                  const done = parte.vueltas.filter(v=>checked[`${pi}-${v.num}`]).length;
                  return (
                    <div key={pi} style={{...S.card, borderLeft:"4px solid #a855d4"}}>
                      <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10}}>
                        <div>
                          <div style={{fontSize:15, fontWeight:"bold", color:"#6b2fa0"}}>◆ {parte.nombre}</div>
                          <div style={{fontSize:11, color:"#9333ea", marginTop:2}}>🎨 {parte.color} · Inicio: {parte.puntoInicial}</div>
                        </div>
                        <div style={{fontSize:11, color:"#a855d4", textAlign:"right"}}>{done}/{parte.vueltas.length}<br/>vueltas</div>
                      </div>
                      <div style={{display:"flex", flexDirection:"column", gap:3}}>
                        {parte.vueltas.map(v => {
                          const k = `${pi}-${v.num}`;
                          const isDone = !!checked[k];
                          return (
                            <div key={v.num} onClick={()=>toggleRow(pi,v.num)} style={{display:"flex", alignItems:"flex-start", gap:8, padding:"7px 10px", borderRadius:8, cursor:"pointer", background:isDone?"#f0fdf4":"#faf5ff", border:isDone?"1px solid #86efac":"1px solid #e9d5ff", userSelect:"none"}}>
                              <div style={{width:18, height:18, borderRadius:"50%", flexShrink:0, marginTop:1, border:isDone?"none":"2px solid #c4b5fd", background:isDone?"#22c55e":"transparent", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, color:"#fff"}}>
                                {isDone?"✓":""}
                              </div>
                              <div style={{flex:1}}>
                                <span style={{fontWeight:"bold", color:isDone?"#15803d":"#7c3aed", fontSize:12, marginRight:5}}>V{v.num}:</span>
                                <span style={{fontSize:12, color:isDone?"#166534":"#2d1b3d", textDecoration:isDone?"line-through":"none", opacity:isDone?0.7:1}}>{v.instruccion}</span>
                              </div>
                              <span style={{fontSize:11, color:isDone?"#15803d":"#9333ea", fontWeight:"bold", flexShrink:0}}>[{v.total}pm]</span>
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
                  <div style={S.title}>🔧 Ensamblaje</div>
                  <ol style={{margin:0, padding:"0 0 0 18px"}}>
                    {pattern.ensamblaje.map((s,i)=>(
                      <li key={i} style={{fontSize:12, color:"#4a1d6e", marginBottom:6, lineHeight:1.5}}>{s}</li>
                    ))}
                  </ol>
                </div>

                {/* consejos */}
                {pattern.consejosFinales?.length > 0 && (
                  <div style={{...S.card, background:"#f5f0ff"}}>
                    <div style={S.title}>💡 Consejos finales</div>
                    <ul style={{margin:0, padding:"0 0 0 16px"}}>
                      {pattern.consejosFinales.map((c,i)=>(
                        <li key={i} style={{fontSize:12, color:"#4a1d6e", marginBottom:5, lineHeight:1.5}}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* export actions */}
                <div style={{...S.card, background:"#1e1030", border:"1px solid #6b2fa0"}}>
                  <div style={{fontSize:13, fontWeight:"bold", color:"#e9d5ff", marginBottom:10}}>⬇️ Guardar patrón</div>
                  <div style={{display:"flex", flexDirection:"column", gap:8}}>
                    <button onClick={()=>setPrintView(true)} style={{padding:"13px 16px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#7c3aed,#d946a8)", color:"#fff", fontWeight:"bold", fontSize:13, cursor:"pointer", textAlign:"left"}}>
                      📄 Ver patrón completo para imprimir
                      <div style={{fontSize:10, fontWeight:"normal", opacity:0.8, marginTop:2}}>Desde el navegador → Imprimir → Guardar como PDF</div>
                    </button>
                    <button onClick={copyText} style={{padding:"11px 16px", borderRadius:10, border:"1px solid #6b2fa0", background:"rgba(107,47,160,0.2)", color:"#e9d5ff", fontSize:13, cursor:"pointer", textAlign:"left"}}>
                      📋 Copiar texto plano
                      <div style={{fontSize:10, opacity:0.7, marginTop:2}}>Pega en WhatsApp, Google Docs o notas</div>
                    </button>
                  </div>
                </div>

                <button onClick={generate} style={{...S.ghost, fontSize:13}}>🔄 Regenerar con otra imagen</button>
                <div style={{height:16}}/>
              </>
            )}
          </div>
        )}
      </div>
      <style>{`*{box-sizing:border-box;}@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

const S = {
  card:  { background:"#fff", borderRadius:14, border:"1px solid #e9d5ff", padding:16, boxShadow:"0 2px 10px rgba(107,47,160,0.07)" },
  title: { fontSize:13, fontWeight:"bold", color:"#6b2fa0", marginBottom:10, paddingBottom:6, borderBottom:"1px solid #f3e8ff" },
  ghost: { width:"100%", padding:"9px 14px", borderRadius:10, cursor:"pointer", border:"1px solid #e9d5ff", background:"#faf5ff", color:"#7c3aed", fontSize:13 },
};

const PS = {
  sec:   { marginBottom:16 },
  title: { fontSize:11, fontWeight:"bold", color:"#6b2fa0", textTransform:"uppercase", letterSpacing:1, borderBottom:"2px solid #e9d5ff", paddingBottom:3, marginBottom:8 },
};
