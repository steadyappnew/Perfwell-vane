const PRODUCTS={"gb-200":["Great Britain Commemorative & Definitive Mix, 200g",650],"gb-mach200":["Machin Definitives on Paper, 200g",649],"gb-sec100":["Security Machin Selection, 100g",1199],"gb-sec20":["Security Machin 1st & 2nd Class, 20g",799],"au-60":["Australia Mixed Kiloware, 60g",999],"ww-30":["Worldwide Vintage & Modern Kiloware, 200+ Stamps",799],"ww-100":["Vintage World Postage Stamps, 100 Off Paper",899],"ww-1000":["The Thousand: Worldwide Used Collection",2499],"stock-eu":["Early European Stock Card",3499]};
const ZONES={UK:["United Kingdom",199],EU:["Europe",425],NA:["USA and Canada",650],AP:["Australia, NZ and Asia",725],RW:["Rest of world",795]};
const COUNTRIES="GB,IE,FR,DE,ES,IT,NL,BE,PT,AT,CH,SE,NO,DK,FI,PL,CZ,GR,US,CA,AU,NZ,JP,SG,HK,IN,ZA,AE,BR,MX".split(",");
module.exports=async(req,res)=>{
 if(req.method!=="POST")return res.status(405).json({error:"POST only"});
 try{const{items,zone}=req.body,z=ZONES[zone];if(!z||!items?.length)throw new Error("Bad request");
  const p=new URLSearchParams({mode:"payment",success_url:`${req.headers.origin}/?paid=1`,cancel_url:`${req.headers.origin}/`});
  let i=0;for(const it of items){const pr=PRODUCTS[it.id];if(!pr||!(it.qty>0))throw new Error("Bad item");
   p.set(`line_items[${i}][quantity]`,Math.min(it.qty,20));p.set(`line_items[${i}][price_data][currency]`,"gbp");
   p.set(`line_items[${i}][price_data][unit_amount]`,pr[1]);p.set(`line_items[${i}][price_data][product_data][name]`,pr[0]);i++}
  p.set(`line_items[${i}][quantity]`,1);p.set(`line_items[${i}][price_data][currency]`,"gbp");
  p.set(`line_items[${i}][price_data][unit_amount]`,z[1]);p.set(`line_items[${i}][price_data][product_data][name]`,`Postage: ${z[0]}`);
  COUNTRIES.forEach((c,k)=>p.set(`shipping_address_collection[allowed_countries][${k}]`,c));
  const r=await fetch("https://api.stripe.com/v1/checkout/sessions",{method:"POST",headers:{Authorization:`Bearer ${process.env.STRIPE_SECRET_KEY}`,"Content-Type":"application/x-www-form-urlencoded"},body:p});
  const s=await r.json();if(!s.url)throw new Error(s.error?.message||"Stripe error");res.json({url:s.url});
 }catch(e){res.status(400).json({error:e.message})}};
