require("dotenv").config();
const http=require("http"),fs=require("fs"),path=require("path");
const PORT=process.env.PORT||3000, HOST="0.0.0.0";
const API_URL=process.env.AI_API_URL||"https://api.openai.com/v1/chat/completions";
const MODEL=process.env.AI_MODEL||"gpt-4.1-mini";
const SYSTEM_PROMPT="You are a prompt architect. Transform the user's short request into a practical master prompt using exactly six sections: ROLE, TASK, CONTEXT, REASONING, STOP CONDITIONS, OUTPUT. Do not invent facts. Return valid JSON only with keys role, task, context, reasoning, stopConditions, output. Each value must be a string.";
function send(res,status,data,type="application/json; charset=utf-8"){res.writeHead(status,{"Content-Type":type});res.end(type.startsWith("application/json")?JSON.stringify(data):data)}
function body(req){return new Promise((ok,bad)=>{let x="";req.on("data",c=>x+=c);req.on("end",()=>ok(x));req.on("error",bad)})}
async function generate(prompt){
 if(!process.env.AI_API_KEY||process.env.AI_API_KEY==="your_api_key_here")throw Error("AI_API_KEY belum diatur.");
 const r=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+process.env.AI_API_KEY},body:JSON.stringify({model:MODEL,temperature:.2,response_format:{type:"json_object"},messages:[{role:"system",content:SYSTEM_PROMPT},{role:"user",content:"Short prompt:\n\n"+prompt}]})});
 const raw=await r.text();if(!r.ok)throw Error("AI API error "+r.status+": "+raw);
 const c=JSON.parse(raw).choices?.[0]?.message?.content;if(!c)throw Error("AI tidak mengembalikan hasil.");
 return JSON.parse(c);
}
function staticFile(req,res){const p=req.url.split("?")[0]==="/"?"index.html":req.url.split("?")[0].replace(/^\//,"");const f=path.join(__dirname,p);if(!f.startsWith(__dirname)||!fs.existsSync(f)||!fs.statSync(f).isFile())return send(res,404,{error:"Not found"});const ext=path.extname(f);const t={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};send(res,200,fs.readFileSync(f),t[ext]||"application/octet-stream")}
http.createServer(async(req,res)=>{
 if(req.method==="POST"&&req.url==="/api/generate")try{const b=JSON.parse(await body(req)),p=String(b.prompt||"").trim();if(!p)return send(res,400,{error:"Prompt singkat wajib diisi."});return send(res,200,{result:await generate(p)})}catch(e){return send(res,500,{error:e.message})}
 if(req.method==="GET")return staticFile(req,res);
 return send(res,405,{error:"Method not allowed"});
}).listen(PORT,HOST,()=>console.log("Prompt Anatomy running on "+PORT));
