import { createFileRoute } from "@tanstack/react-router";
import { LeadForm } from "@/components/LeadForm";
import { BrochureGate } from "@/components/BrochureGate";
import bnwLogo from "@/assets/bnw-logo.png.asset.json";

const BROCHURES: Record<string, string> = {
  "Taj Wellington Mews": "https://bnwlpage.lovable.app/__l5e/assets-v1/737d88f6-8ff7-4458-af7f-4461d2db563a/taj-brochure.pdf",
  "Tonino Lamborghini Residences": "https://bnwlpage.lovable.app/__l5e/assets-v1/1c79d913-4ac8-45ef-bfa0-27a695f23626/lamborghini-brochure.pdf",
  "Radisson Blu Dubai Central": "https://bnwlpage.lovable.app/__l5e/assets-v1/69fd792f-c6e8-4345-a5ab-b04fed2f69b5/radisson-brochure.pdf",
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BNW Developments | Branded Residences Investment" },
      {
        name: "description",
        content:
          "Earn 8-10% NET potential returns through BNW branded residences across Dubai, RAK Central, and Al Marjan Island.",
      },
      { property: "og:title", content: "BNW Developments | Branded Residences Investment" },
      {
        property: "og:description",
        content:
          "Compare BNW opportunities across Dubai, RAK Central, and Al Marjan Island with branded hospitality partnerships and freehold ownership.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@400;500;600;700;800&display=swap",
      },
    ],
  }),
  component: Index,
});

const styles = `
:root{
  --ink:#080806;--ink-soft:#11100c;--paper:#f6f1e7;--muted:#b9ad95;
  --line:rgba(219,183,95,.22);--gold:#d9b45c;--gold-soft:#f0d58b;
  --green:#526b4a;--rust:#8b4b32;--white:#fffdf7;
  --serif:'Cormorant Garamond',Georgia,serif;
  --sans:'Inter','Segoe UI',Arial,sans-serif;
}
.bnw *{box-sizing:border-box;margin:0;padding:0}
.bnw{font-family:var(--sans);background:var(--ink);color:var(--paper);-webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh}
.bnw a{color:inherit;text-decoration:none}
.bnw img{display:block;max-width:100%}
.bnw .page{min-height:100vh;background:radial-gradient(circle at 78% 5%,rgba(217,180,92,.16),transparent 30%),linear-gradient(180deg,#060604 0%,#0c0b08 46%,#050504 100%)}
.bnw .nav{position:fixed;top:0;left:0;right:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:14px clamp(20px,4vw,64px);background:rgba(8,8,6,.9);border-bottom:1px solid var(--line);backdrop-filter:blur(18px)}
.bnw .logo-fallback{color:var(--white);font-family:var(--serif);font-size:22px;font-weight:700;line-height:1}
.bnw .logo-fallback small{display:block;color:var(--gold-soft);font-family:var(--sans);font-size:8px;font-weight:800;letter-spacing:.16em;text-transform:uppercase;margin-top:2px}
.bnw .brand-logo{display:block;height:72px;width:auto;object-fit:contain}
.bnw .footer .brand-logo{height:56px;opacity:.9}
.bnw .nav-links{display:flex;align-items:center;gap:26px;list-style:none;color:var(--muted);font-size:12px;font-weight:600;letter-spacing:.08em;text-transform:uppercase}
.bnw .nav-links a:hover{color:var(--gold-soft)}
.bnw .nav-action{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:0 18px;border:1px solid var(--gold);background:var(--gold);color:#151008;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;transition:.25s ease;cursor:pointer}
.bnw .nav-action:hover{background:var(--gold-soft);transform:translateY(-1px)}
.bnw .hero{position:relative;min-height:calc(100vh - 20px);display:grid;grid-template-columns:minmax(0,1.02fr) minmax(360px,.66fr);gap:36px;align-items:center;padding:88px clamp(20px,5vw,76px) 22px;overflow:hidden}
.bnw .hero:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 82% 22%,rgba(217,180,92,.24),transparent 28%),linear-gradient(90deg,rgba(5,5,4,.98) 0%,rgba(8,8,6,.86) 52%,rgba(8,8,6,.54) 100%),url('https://bnw.ae/_next/static/media/tl1.5d03a922.jpg') center/cover no-repeat;opacity:.94}
.bnw .hero:after{content:"";position:absolute;inset:auto 0 0;height:26vh;background:linear-gradient(180deg,transparent,var(--ink))}
.bnw .hero-copy,.bnw .lead-panel{position:relative;z-index:2}
.bnw .eyebrow{display:inline-flex;align-items:center;gap:12px;color:var(--gold-soft);font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase;margin-bottom:16px}
.bnw .eyebrow:before{content:"";width:34px;height:1px;background:var(--gold)}
.bnw .hero-eyebrow{display:flex;align-items:center;justify-content:flex-start;gap:14px;margin-bottom:22px;flex-wrap:wrap}
.bnw .hero-eyebrow .eyebrow-text{color:var(--gold-soft);font-size:clamp(12px,1.4vw,16px);font-weight:800;letter-spacing:.32em;text-transform:uppercase;white-space:nowrap}
.bnw .hero-eyebrow .eyebrow-line{flex:0 0 48px;height:1px;background:linear-gradient(90deg,transparent,var(--gold),transparent)}
@media (max-width:640px){.bnw .hero-eyebrow{gap:10px;margin-bottom:16px}.bnw .hero-eyebrow .eyebrow-line{flex-basis:28px}.bnw .hero-eyebrow .eyebrow-text{letter-spacing:.24em}}
.bnw h1{font-family:var(--serif);font-size:clamp(42px,5vw,72px);line-height:.9;font-weight:600;letter-spacing:0;max-width:780px;color:var(--white)}
.bnw h1 span{color:var(--gold-soft);font-style:italic}
.bnw .hero-text{max-width:650px;margin-top:18px;color:#d8ceb8;font-size:15.5px;line-height:1.58}
.bnw .return-strip{display:grid;grid-template-columns:170px 1fr;gap:28px;align-items:center;width:min(100%,720px);margin-top:20px;padding:18px 26px;border:1px solid rgba(217,180,92,.42);background:linear-gradient(135deg,rgba(217,180,92,.13),rgba(8,8,6,.72));box-shadow:0 20px 52px rgba(0,0,0,.28)}
.bnw .return-value{font-family:var(--serif);font-size:clamp(28px,3.1vw,44px);line-height:.9;color:var(--gold-soft);font-weight:700}
.bnw .return-copy strong{display:block;color:var(--white);font-size:17px;line-height:1.22;margin-bottom:5px}
.bnw .return-copy p{color:var(--muted);font-size:11.5px;line-height:1.55;max-width:470px}
.bnw .hero-actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:18px}
.bnw .hero-proof{display:grid;grid-template-columns:repeat(3,1fr);gap:0;width:min(100%,720px);margin-top:14px;border:1px solid rgba(217,180,92,.22);background:rgba(6,6,4,.48)}
.bnw .proof-item{padding:12px 14px;border-right:1px solid rgba(217,180,92,.2)}
.bnw .proof-item:last-child{border-right:0}
.bnw .proof-item b{display:block;font-family:var(--serif);font-size:24px;line-height:.95;color:var(--gold-soft)}
.bnw .proof-item span{display:block;margin-top:5px;color:#a99f89;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;line-height:1.35}
.bnw .btn{display:inline-flex;align-items:center;justify-content:center;min-height:42px;padding:0 20px;border:1px solid var(--gold);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;transition:.25s ease;cursor:pointer}
.bnw .btn.primary{background:var(--gold);color:#151008}
.bnw .btn.primary:hover{background:var(--gold-soft);transform:translateY(-1px)}
.bnw .btn.secondary{color:var(--paper);background:rgba(255,255,255,.04)}
.bnw .btn.secondary:hover{background:rgba(217,180,92,.1);color:var(--gold-soft)}
.bnw .lead-panel{align-self:stretch;display:flex;align-items:center}
.bnw .form-card{width:100%;padding:26px;border:1px solid rgba(217,180,92,.34);background:rgba(10,10,8,.9);box-shadow:0 24px 70px rgba(0,0,0,.44);backdrop-filter:blur(12px)}
.bnw .form-card h2{font-family:var(--serif);font-size:30px;line-height:1;font-weight:600;color:var(--white);margin-bottom:8px}
.bnw .form-card p{color:var(--muted);font-size:12.5px;line-height:1.55;margin-bottom:16px}
.bnw .field{margin-bottom:10px}
.bnw .field-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bnw input:not([type="checkbox"]):not([type="radio"]),.bnw select,.bnw textarea{width:100%;min-height:42px;border:1px solid rgba(217,180,92,.28);background:rgba(255,255,255,.04);color:var(--paper);font-family:var(--sans);font-size:13px;padding:0 13px;outline:none;border-radius:0}
.bnw input[type="checkbox"]{width:16px;height:16px;min-height:0;accent-color:var(--gold);cursor:pointer;flex-shrink:0}
.bnw textarea{height:62px;padding-top:12px;resize:vertical}
.bnw input::placeholder,.bnw textarea::placeholder{color:#837965}
.bnw input:focus,.bnw select:focus,.bnw textarea:focus{border-color:var(--gold);background:rgba(217,180,92,.08)}
.bnw option{background:#11100c}
.bnw .submit{width:100%;border:0;background:var(--gold);color:#151008;min-height:44px;font-size:11px;font-weight:900;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;margin-top:2px}
.bnw .submit:hover{background:var(--gold-soft)}
.bnw .privacy{font-size:10px;color:#8d836f;text-align:center;margin-top:9px;line-height:1.45}
.bnw .destination{position:relative;padding:70px clamp(20px,5vw,76px);background:#050504;overflow:hidden;border-top:1px solid rgba(217,180,92,.12);border-bottom:1px solid rgba(217,180,92,.12)}
.bnw .destination:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,4,.84),rgba(5,5,4,.78)),url('https://bnw.ae/_next/static/media/whyBnwDevelopment.bd4ce625.png') center/cover no-repeat;opacity:.78}
.bnw .destination-inner{position:relative;z-index:1;max-width:980px;margin:0 auto;text-align:center}
.bnw .destination-kicker{color:var(--gold);font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:18px}
.bnw .destination-quote{font-family:var(--serif);font-size:clamp(34px,4.1vw,58px);line-height:1.04;color:var(--white);max-width:900px;margin:0 auto}
.bnw .destination-quote em{color:var(--gold-soft);font-style:italic}
.bnw .destination-note{margin:18px auto 0;color:var(--muted);font-size:14px;line-height:1.7;max-width:620px}
.bnw .wynn-section{position:relative;padding:64px clamp(20px,5vw,76px);background:#050504;border-top:1px solid rgba(217,180,92,.16);border-bottom:1px solid rgba(217,180,92,.16);overflow:hidden}
.bnw .wynn-inner{position:relative;min-height:620px;border:1px solid rgba(217,180,92,.3);background:linear-gradient(90deg,rgba(5,5,4,.9) 0%,rgba(5,5,4,.66) 44%,rgba(5,5,4,.18) 100%),url('https://preview.thenewsmarket.com/Previews/WYNN/StillAssets/1920x1080/667364_v4.jpg') center/cover no-repeat;box-shadow:0 32px 90px rgba(0,0,0,.42);display:grid;grid-template-columns:minmax(0,.72fr) minmax(300px,.42fr);gap:28px;align-items:end;padding:42px}
.bnw .wynn-kicker{color:var(--gold-soft);font-size:11px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;margin-bottom:16px}
.bnw .wynn-title{font-family:var(--serif);font-size:clamp(38px,4.5vw,62px);line-height:.96;color:var(--white);max-width:650px}
.bnw .wynn-title em{color:var(--gold-soft);font-style:italic}
.bnw .wynn-copy{max-width:600px;color:#d8ceb8;font-size:14.5px;line-height:1.72;margin-top:18px}
.bnw .wynn-grid{display:grid;grid-template-columns:1fr;gap:10px;align-self:end}
.bnw .wynn-stat{border:1px solid rgba(217,180,92,.34);background:rgba(8,8,6,.74);padding:18px}
.bnw .wynn-stat b{display:block;font-family:var(--serif);font-size:36px;line-height:.92;color:var(--gold-soft)}
.bnw .wynn-stat span{display:block;color:var(--muted);font-size:11px;font-weight:800;letter-spacing:.12em;text-transform:uppercase;line-height:1.45;margin-top:8px}
.bnw .section{padding:92px clamp(20px,5vw,76px);background:#060604}
.bnw .section.alt{background:#0b0a08;color:var(--paper);border-top:1px solid rgba(217,180,92,.12);border-bottom:1px solid rgba(217,180,92,.12)}
.bnw .section-head{display:flex;align-items:end;justify-content:space-between;gap:30px;margin-bottom:36px}
.bnw .label{font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase;color:var(--gold);margin-bottom:12px}
.bnw h3{font-family:var(--serif);font-size:clamp(38px,5vw,68px);line-height:.98;font-weight:600;max-width:760px;color:var(--white)}
.bnw .section-intro{max-width:560px;color:var(--muted);line-height:1.75;font-size:15px}
.bnw .rationale-section{position:relative;padding:86px clamp(20px,5vw,76px);background:#050504;overflow:hidden}
.bnw .rationale-section:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(5,5,4,.8),rgba(5,5,4,.92)),url('https://bnw.ae/_next/static/media/embrace.0ee07077.jpg') center/cover no-repeat;opacity:.9}
.bnw .rationale-wrap{position:relative;z-index:1;max-width:1220px;margin:0 auto}
.bnw .rationale-head{text-align:center;max-width:850px;margin:0 auto 34px}
.bnw .rationale-head h3{margin:0 auto;color:var(--white);font-size:clamp(36px,4.6vw,64px)}
.bnw .rationale-lead{margin:16px auto 0;max-width:640px;color:var(--muted);font-size:14px;line-height:1.75}
.bnw .rationale-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.bnw .reason-card{min-height:220px;border:1px solid rgba(217,180,92,.28);background:rgba(8,8,6,.72);padding:24px;display:flex;flex-direction:column;justify-content:space-between;box-shadow:0 18px 50px rgba(0,0,0,.2)}
.bnw .reason-card b{font-family:var(--serif);font-size:34px;line-height:1;color:var(--gold-soft);font-weight:600}
.bnw .reason-card h4{font-size:18px;line-height:1.2;color:var(--white);margin:18px 0 8px}
.bnw .reason-card p{color:var(--muted);font-size:13px;line-height:1.62}
.bnw .rationale-section .risk{position:relative;z-index:1;margin:22px auto 0;max-width:760px;text-align:center;color:#948a78;border-top:1px solid rgba(217,180,92,.18);padding-top:16px;font-size:11px;line-height:1.75}
.bnw .projects{display:grid;grid-template-columns:1fr;gap:22px}
.bnw .project{min-height:440px;position:relative;overflow:hidden;border:1px solid rgba(217,180,92,.3);background:#111;display:grid;grid-template-columns:minmax(320px,.74fr) 1fr;transition:transform .25s ease,border-color .25s ease}
.bnw .project:hover{transform:translateY(-3px);border-color:rgba(217,180,92,.58)}
.bnw .project-media{position:relative;min-height:440px;background:#111;overflow:hidden}
.bnw .project-media:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.54))}
.bnw .project:nth-child(1) .project-media{background:url('https://bnw.ae/_next/static/media/left.375ea75a.png') center/cover no-repeat}
.bnw .project:nth-child(2) .project-media{background:url('/__l5e/assets-v1/999e049e-58c2-4b15-adaf-1e19b9f14572/taj.png') center/cover no-repeat}
.bnw .project:nth-child(3) .project-media{background:url('/__l5e/assets-v1/dee350d8-346a-4519-a2c1-44660551db30/radisson.png') center/cover no-repeat}
.bnw .project:nth-child(4) .project-media{background:url('/__l5e/assets-v1/3027eff9-81ea-4e87-a3b4-1176d144d00c/tonino.png') center/cover no-repeat}
.bnw .project-content{position:relative;padding:42px;display:flex;flex-direction:column;justify-content:center;background:linear-gradient(135deg,rgba(12,11,8,.98),rgba(22,18,10,.92))}
.bnw .project-index{position:absolute;top:28px;right:34px;font-family:var(--serif);font-size:46px;line-height:.9;color:rgba(240,213,139,.54)}
.bnw .tag{display:inline-block;width:max-content;border:1px solid rgba(217,180,92,.45);color:var(--gold-soft);font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;padding:8px 10px;margin-bottom:18px}
.bnw .project h4{font-family:var(--serif);font-size:clamp(38px,4.4vw,64px);line-height:.92;color:var(--white);margin-bottom:14px;max-width:560px}
.bnw .project p{color:#d7ceb9;font-size:15px;line-height:1.72;max-width:620px}
.bnw .project-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}
.bnw .project-meta span{border:1px solid rgba(217,180,92,.34);background:rgba(8,8,6,.66);color:#f0d58b;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:8px 10px}
.bnw .project-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}
.bnw .project-actions a{display:flex;align-items:center;justify-content:center;min-height:42px;min-width:156px;border:1px solid rgba(217,180,92,.42);font-size:10px;font-weight:900;letter-spacing:.1em;text-transform:uppercase;color:var(--gold-soft);background:rgba(8,8,6,.58);white-space:nowrap;padding:0 14px;cursor:pointer}
.bnw .project-actions a.reserve{background:var(--gold);color:#121008;border-color:var(--gold)}
.bnw .final-cta{padding:90px clamp(20px,5vw,76px);background:linear-gradient(120deg,#11100c,#1b160d 48%,#293527);border-top:1px solid var(--line);border-bottom:1px solid var(--line);display:grid;grid-template-columns:1fr auto;gap:30px;align-items:center}
.bnw .final-cta .label{color:var(--gold)}
.bnw .final-cta h3{max-width:850px}
.bnw .final-cta p{max-width:640px;color:var(--muted);line-height:1.75;margin-top:18px}
.bnw .footer{padding:36px clamp(20px,5vw,76px);display:flex;justify-content:space-between;gap:20px;align-items:center;color:#8f846e;font-size:12px}
@media (max-width:980px){
  .bnw .nav-links{display:none}
  .bnw .hero{grid-template-columns:1fr;min-height:auto;padding:96px 24px 40px;gap:28px}
  .bnw .lead-panel{align-self:auto}
  .bnw .rationale-grid{grid-template-columns:repeat(2,1fr)}
  .bnw .wynn-inner{grid-template-columns:1fr;min-height:auto;padding:30px;background-position:center;gap:24px;align-items:start}
  .bnw .wynn-grid{align-self:auto}
  .bnw .project{grid-template-columns:1fr}
  .bnw .project-media{min-height:280px}
  .bnw .project-content{padding:30px}
  .bnw .section-head{display:block}
  .bnw .section-intro{margin-top:18px}
  .bnw .return-strip{grid-template-columns:1fr;gap:14px;padding:20px}
  .bnw .final-cta{grid-template-columns:1fr;padding:70px 24px}
  .bnw .footer{display:block;text-align:center}
  .bnw .footer p{margin-top:18px}
}
@media (max-width:640px){
  .bnw .nav{padding:12px 16px;gap:12px}
  .bnw .nav-action{min-height:36px;padding:0 12px;font-size:10px;letter-spacing:.06em}
  .bnw .brand-logo{height:52px}
  .bnw .hero{padding:88px 18px 36px;gap:24px}
  .bnw h1{font-size:38px;line-height:.95}
  .bnw .hero-text{font-size:14.5px;margin-top:14px}
  .bnw .return-strip{padding:16px}
  .bnw .return-value{font-size:34px;text-align:left}
  .bnw .return-copy strong{font-size:15px}
  .bnw .return-copy p{font-size:11.5px}
  .bnw .hero-proof{grid-template-columns:1fr;width:100%}
  .bnw .proof-item{border-right:0;border-bottom:1px solid rgba(217,180,92,.2);padding:12px 14px}
  .bnw .proof-item:last-child{border-bottom:0}
  .bnw .proof-item b{font-size:22px}
  .bnw .hero-actions{flex-direction:column;width:100%}
  .bnw .hero-actions .btn{width:100%}
  .bnw .form-card{padding:20px}
  .bnw .form-card h2{font-size:24px}
  .bnw .field-row{grid-template-columns:1fr}
  .bnw .destination{padding:56px 18px}
  .bnw .destination-quote{font-size:28px;line-height:1.1}
  .bnw .destination-note{font-size:13px}
  .bnw .wynn-section{padding:48px 16px}
  .bnw .wynn-inner{padding:24px 20px;min-height:auto}
  .bnw .wynn-title{font-size:32px}
  .bnw .wynn-copy{font-size:13.5px;margin-top:14px}
  .bnw .wynn-stat{padding:14px}
  .bnw .wynn-stat b{font-size:28px}
  .bnw .section,.bnw .section.alt{padding:64px 18px}
  .bnw .rationale-section{padding:64px 18px}
  .bnw .rationale-grid{grid-template-columns:1fr;gap:12px}
  .bnw .reason-card{min-height:auto;padding:22px}
  .bnw h3{font-size:34px;line-height:1.02}
  .bnw .section-intro{font-size:14px}
  .bnw .project{min-height:auto}
  .bnw .project-media{min-height:220px}
  .bnw .project-content{padding:24px 22px}
  .bnw .project-index{font-size:34px;top:18px;right:22px}
  .bnw .project h4{font-size:30px;line-height:1}
  .bnw .project p{font-size:14px}
  .bnw .project-actions{flex-direction:column;gap:8px}
  .bnw .project-actions a{width:100%;min-width:0}
  .bnw .final-cta{padding:64px 20px;gap:22px}
  .bnw .final-cta h3{font-size:32px}
  .bnw .final-cta p{font-size:14px}
  .bnw .footer{padding:28px 18px;font-size:11.5px}
  .bnw .footer .brand-logo{height:46px;margin:0 auto}
}
`;

const projects = [
  {
    tag: "Al Furjan, Dubai",
    name: "Orvessa Residences",
    desc: "A Dubai-based Michel Adam branded residence designed for investors who want an accessible entry into BNW's portfolio, with 1, 2 and 3-bedroom layouts, rooftop pool, wellness, co-working and family amenities.",
    meta: ["From AED 1.27M", "92 apartments", "Q3 2028"],
  },
  {
    tag: "Al Marjan Island",
    name: "Taj Wellington Mews",
    brand: "Taj",
    tagline: "Heritage · Wellness",
    desc: "Taj-branded twin-tower hotel apartments on Al Marjan Island, built around ocean views, refined hospitality, spa, dining, and a premium short-stay rental narrative near the Wynn growth corridor.",
    meta: ["From AED 1.5M", "336 units", "Q1 2028"],
  },
  {
    tag: "RAK Central",
    name: "Radisson Blu Dubai Central",
    brand: "Radisson Blu",
    tagline: "Urban · Resort",
    desc: "Hospitality-led branded residences and hotel living in RAK Central, positioned for the emirate's business, leisure, and live-work-play demand as Ras Al Khaimah scales up.",
    meta: ["From AED 1.12M", "222 apartments", "Q4 2029"],
  },
  {
    tag: "Al Marjan Island",
    name: "Tonino Lamborghini Residences",
    brand: "Tonino Lamborghini",
    tagline: "Italian Craftsmanship",
    desc: "Italian-inspired waterfront residences, penthouses, villas, and mansions on Al Marjan Island, made for buyers seeking a more expressive luxury address with resort-style wellness amenities.",
    meta: ["From AED 1.69M", "378 units", "Q4 2028"],
  },
];

const reasons = [
  { n: "01", h: "Hospitality-Led Demand", p: "Branded residences carry stronger rental appeal when backed by design, amenities, service standards and destination value." },
  { n: "02", h: "RAK Growth Catalyst", p: "Al Marjan Island and RAK Central continue to benefit from tourism growth, infrastructure and waterfront development." },
  { n: "03", h: "Clear Ownership Benefits", p: "Freehold ownership, no annual property tax and investor-friendly UAE positioning make the proposition easy to understand." },
  { n: "04", h: "Premium Exit Story", p: "BNW's branded collaborations give buyers a stronger resale and rental narrative than a generic off-plan unit." },
];

function Index() {
  return (
    <div className="bnw">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="page">
        <nav className="nav">
          <a href="#opportunity" aria-label="BNW Developments home">
            <img src={bnwLogo.url} alt="BNW Developments" className="brand-logo" />
          </a>
          <ul className="nav-links">
            <li><a href="#opportunity">Opportunity</a></li>
            <li><a href="#why">Why BNW</a></li>
            <li><a href="#portfolio">Portfolio</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
          <a href="#contact" className="nav-action">Get Details</a>
        </nav>

        <section className="hero" id="opportunity">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="eyebrow-line" aria-hidden="true" />
              <span className="eyebrow-text">BNW DEVELOPMENTS UAE</span>
              <span className="eyebrow-line" aria-hidden="true" />
            </div>
            <h1>Earn <span>8-10% NET</span> potential returns through BNW branded residences.</h1>
            <p className="hero-text">Compare BNW opportunities across Dubai, RAK Central, and Al Marjan Island, with branded hospitality partnerships, freehold ownership, and long-term rental demand.</p>
            <div className="return-strip">
              <div className="return-value">Projected<br />Net Yield</div>
              <div className="return-copy">
                <strong>Built around branded rental demand and UAE ownership advantages</strong>
                <p>Final projections depend on unit selection, purchase price, rental performance, service charges, occupancy, and market conditions.</p>
              </div>
            </div>
            <div className="hero-proof">
              <div className="proof-item"><b>BNW</b><span>Branded residences</span></div>
              <div className="proof-item"><b>2028</b><span>Key handover window</span></div>
              <div className="proof-item"><b>0%</b><span>Annual property tax</span></div>
            </div>
            <div className="hero-actions">
              <a href="#contact" className="btn primary">Request Investor Pack</a>
              <a href="#portfolio" className="btn secondary">View Projects</a>
            </div>
          </div>
          <div className="lead-panel" id="contact">
            <div className="form-card">
              <h2>Request BNW availability</h2>
              <p>Receive current prices, floor plans, payment options, and rental-yield assumptions for BNW opportunities.</p>
              <LeadForm />
            </div>
          </div>
        </section>

        <section className="destination">
          <div className="destination-inner">
            <div className="destination-kicker">The Destination</div>
            <h3 className="destination-quote">Ras Al Khaimah is no longer the Emirates' best-kept secret — <em>it is the world's next great destination.</em></h3>
            <p className="destination-note">BNW's portfolio gives investors access to both Ras Al Khaimah's resort growth story and Dubai's established residential demand.</p>
          </div>
        </section>

        <section className="wynn-section">
          <div className="wynn-inner">
            <div>
              <div className="wynn-kicker">Mega Catalyst · Al Marjan Island</div>
              <h3 className="wynn-title"><em>Wynn Al Marjan Island</em> is the demand driver investors are watching.</h3>
              <p className="wynn-copy">The upcoming integrated resort is expected to open in early 2027 and is positioned to transform Ras Al Khaimah into a global luxury tourism destination. For nearby branded residences, that means stronger destination awareness, deeper hospitality demand, and a clearer rental story.</p>
            </div>
            <div className="wynn-grid">
              <div className="wynn-stat"><b>$5.1B</b><span>Reported project budget</span></div>
              <div className="wynn-stat"><b>2027</b><span>Expected opening</span></div>
              <div className="wynn-stat"><b>22</b><span>Restaurants, lounges and bars</span></div>
              <div className="wynn-stat"><b>UAE First</b><span>Integrated resort positioning</span></div>
            </div>
          </div>
        </section>

        <section className="rationale-section" id="why">
          <div className="rationale-wrap">
            <div className="rationale-head">
              <div className="label">Investor Rationale</div>
              <h3>Why BNW residences support strong rental potential.</h3>
              <p className="rationale-lead">A luxury real estate investment story works best when the lifestyle, location and ownership logic are clear at a glance.</p>
            </div>
            <div className="rationale-grid">
              {reasons.map((r) => (
                <div key={r.n} className="reason-card">
                  <b>{r.n}</b>
                  <div>
                    <h4>{r.h}</h4>
                    <p>{r.p}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="risk">Return figures are projections only and are not guaranteed. Buyers should verify rental assumptions, expenses, handover date, service charges, fees and market data before making a purchase decision.</p>
          </div>
        </section>

        <section className="section" id="portfolio">
          <div className="section-head">
            <div>
              <div className="label">Featured Portfolio</div>
              <h3>Compare BNW investment opportunities.</h3>
            </div>
            <p className="section-intro">Review Orvessa, Taj Wellington Mews, Radisson Blu, and Tonino Lamborghini Residences, then request the latest availability, payment options, and rental-yield assumptions.</p>
          </div>
          <div className="projects">
            {projects.map((p, i) => (
              <article key={p.name} className="project">
                <div className="project-media" />
                <div className="project-content">
                  <div className="project-index">{String(i + 1).padStart(2, "0")}</div>
                  <span className="tag">{p.tag}</span>
                  <h4>{p.name}</h4>
                  {p.brand && (
                    <p style={{ color: "#d9b45c", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase", margin: "-6px 0 10px" }}>
                      {p.brand} · {p.tagline}
                    </p>
                  )}
                  <p>{p.desc}</p>
                  <div className="project-meta">
                    {p.meta.map((m) => <span key={m}>{m}</span>)}
                  </div>
                  <div className="project-actions">
                    {BROCHURES[p.name] ? (
                      <BrochureGate pdfUrl={BROCHURES[p.name]} projectName={p.name} className="bnw-link" />
                    ) : (
                      <a href="#contact">Request Details</a>
                    )}
                    <a href="#contact" className="reserve">Reserve Unit</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="final-cta">
          <div>
            <div className="label">Limited Investor Access</div>
            <h3>Request BNW availability, prices, and return projections.</h3>
            <p>Speak with an advisor to compare suitable BNW residences, understand payment plans, review possible rental income, and secure preferred units before availability changes.</p>
          </div>
          <a href="#contact" className="btn primary">Request Details</a>
        </section>

        <footer className="footer">
          <img src={bnwLogo.url} alt="BNW Developments" className="brand-logo" />
          <p>BNW Developments investor information. Possible returns are projections and not guaranteed; final details are subject to availability, fees, and market conditions.</p>
        </footer>
      </div>
    </div>
  );
}
