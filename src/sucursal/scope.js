// Curated exclusions from the canonical synthetic guide, with exact source binding.
// A matched exclusion can veto a model selection but never invent an allowed step.
const normalize = s => s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const exclusions = [
  {pattern:/\b(pin|clave|contrasena)\b|banca movil|aplicacion bancaria/,text:'No contiene procedimientos de desbloqueo de banca móvil ni recuperación de PIN.'},
  {pattern:/\b(horario|horarios|hora de apertura|hora de cierre)\b|a que hora (abre|cierra)/,text:'No fija tasas de interés, tipos de cambio ni horarios de atención.'},
  {pattern:/\b(tasa|tasas|interes|rendimiento|rinde|tipo de cambio)\b/,text:'No fija tasas de interés, tipos de cambio ni horarios de atención.'},
  {pattern:/\b(hipotec|criptomoneda|criptomonedas|seguro de vida|seguros de vida)/,text:'No define préstamos hipotecarios, inversiones en criptomonedas ni seguros de vida.'}
];
export function scopeExclusion(source, question) {
  const s=source.sections.find(s=>s.id==='ALC-GUI-01');if(!s)return null;
  const rule=exclusions.find(r=>r.pattern.test(normalize(question))&&s.text.includes(r.text));
  if(!rule)return null;
  const start=source.text.indexOf(rule.text,s.start);
  return {sourceDocumentId:source.documentId,sourceVersion:source.version,sourceHash:source.sourceHash,sectionId:s.id,start,end:start+rule.text.length,excerpt:rule.text};
}
