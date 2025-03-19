(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[1826],{14170:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});var a=s(12115);let r=a.forwardRef(function(e,t){let{title:s,titleId:r,...n}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),s?a.createElement("title",{id:r},s):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"}))})},32461:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});var a=s(12115);let r=a.forwardRef(function(e,t){let{title:s,titleId:r,...n}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),s?a.createElement("title",{id:r},s):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"}))})},35695:(e,t,s)=>{"use strict";var a=s(18999);s.o(a,"useParams")&&s.d(t,{useParams:function(){return a.useParams}}),s.o(a,"usePathname")&&s.d(t,{usePathname:function(){return a.usePathname}}),s.o(a,"useRouter")&&s.d(t,{useRouter:function(){return a.useRouter}}),s.o(a,"useSearchParams")&&s.d(t,{useSearchParams:function(){return a.useSearchParams}})},48825:(e,t,s)=>{"use strict";s.r(t),s.d(t,{default:()=>f});var a=s(95155),r=s(12115),n=s(35695),l=s(6874),i=s.n(l),d=s(32461),o=s(14170),m=s(72227),c=s(82771),u=s(93578);let h=[{id:"1",name:"Jane Cooper",dateOfBirth:"1985-02-12"},{id:"2",name:"Wade Warren",dateOfBirth:"1972-06-18"},{id:"3",name:"Esther Howard",dateOfBirth:"1968-12-04"},{id:"4",name:"Cameron Williamson",dateOfBirth:"1991-10-25"},{id:"5",name:"Brooklyn Simmons",dateOfBirth:"1979-05-30"}],x=[{id:"p1",name:"Dr. Smith"},{id:"p2",name:"Dr. Johnson"},{id:"p3",name:"Dr. Williams"},{id:"p4",name:"Dr. Davis"}],g=[{value:15,label:"15 minutes"},{value:30,label:"30 minutes"},{value:45,label:"45 minutes"},{value:60,label:"1 hour"},{value:90,label:"1 hour 30 minutes"}];function p(){let e=(0,n.useRouter)(),t=(0,n.useSearchParams)().get("patientId"),[s,l]=(0,r.useState)({patientId:t||"",templateId:"",date:"",time:"",duration:45,provider:"",notes:""}),[p,f]=(0,r.useState)(!1),[v,b]=(0,r.useState)([]),[j,w]=(0,r.useState)({}),[y,N]=(0,r.useState)(!1),[k,S]=(0,r.useState)(!1);(0,r.useEffect)(()=>{(()=>{try{let e=(0,u.yv)();b(e)}catch(e){console.error("Error loading templates:",e)}})()},[]);let I=e=>e.toISOString().split("T")[0];(0,r.useEffect)(()=>{let e=new Date;e.setDate(e.getDate()+1),l(t=>({...t,date:I(e)}))},[]);let E=e=>{let{name:t,value:s}=e.target;l(e=>({...e,[t]:s})),j[t]&&w(e=>{let s={...e};return delete s[t],s})},C=()=>{let e={};return s.patientId||(e.patientId="Please select a patient"),s.templateId||(e.templateId="Please select a template"),s.date||(e.date="Please select a date"),s.time||(e.time="Please select a time"),s.provider||(e.provider="Please select a provider"),w(e),0===Object.keys(e).length};return k?(0,a.jsxs)("div",{className:"bg-white shadow sm:rounded-lg p-6 text-center",children:[(0,a.jsx)("div",{className:"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100",children:(0,a.jsx)("svg",{className:"h-6 w-6 text-green-600",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:(0,a.jsx)("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 13l4 4L19 7"})})}),(0,a.jsx)("h3",{className:"mt-3 text-lg leading-6 font-medium text-gray-900",children:"Visit Scheduled Successfully!"}),(0,a.jsx)("p",{className:"mt-2 text-sm text-gray-500",children:"Your visit has been scheduled. Redirecting to visits page..."})]}):(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"mb-6",children:[(0,a.jsxs)(i(),{href:"/dashboard-visits",className:"inline-flex items-center text-sm text-gray-500 hover:text-gray-700",children:[(0,a.jsx)(d.A,{className:"h-4 w-4 mr-1"}),"Back to Visits"]}),(0,a.jsx)("h1",{className:"text-2xl font-bold text-gray-900 mt-2",children:"Schedule New Visit"})]}),(0,a.jsx)("div",{className:"bg-white shadow overflow-hidden sm:rounded-lg",children:(0,a.jsxs)("form",{onSubmit:t=>{t.preventDefault(),C()&&(N(!0),setTimeout(()=>{console.log("Scheduling new visit with data:",s),N(!1),S(!0),setTimeout(()=>{e.push("/visits")},1500)},1e3))},children:[(0,a.jsx)("div",{className:"px-4 py-5 sm:p-6",children:(0,a.jsxs)("div",{className:"grid grid-cols-1 gap-6 sm:grid-cols-2",children:[(0,a.jsxs)("div",{className:"sm:col-span-2",children:[(0,a.jsx)("label",{htmlFor:"patientId",className:"block text-sm font-medium text-gray-700",children:"Patient*"}),(0,a.jsxs)("div",{className:"mt-1",children:[(0,a.jsxs)("select",{id:"patientId",name:"patientId",value:s.patientId,onChange:E,className:"block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ".concat(j.patientId?"ring-red-300":"ring-gray-300"," placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"),children:[(0,a.jsx)("option",{value:"",children:"Select a patient"}),h.map(e=>(0,a.jsxs)("option",{value:e.id,children:[e.name," (DOB: ",new Date(e.dateOfBirth).toLocaleDateString(),")"]},e.id))]}),j.patientId&&(0,a.jsx)("p",{className:"mt-2 text-sm text-red-600",children:j.patientId})]}),s.patientId&&(0,a.jsxs)("div",{className:"mt-2 flex items-center text-sm text-gray-500",children:[(0,a.jsx)(o.A,{className:"mr-1 h-4 w-4 text-gray-400"}),"Selected: ",(e=>{let t=h.find(t=>t.id===e);return t?t.name:""})(s.patientId)]})]}),(0,a.jsxs)("div",{className:"sm:col-span-2",children:[(0,a.jsx)("label",{htmlFor:"templateId",className:"block text-sm font-medium text-gray-700",children:"Template*"}),(0,a.jsxs)("div",{className:"mt-1",children:[(0,a.jsxs)("select",{id:"templateId",name:"templateId",value:s.templateId,onChange:E,className:"block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ".concat(j.templateId?"ring-red-300":"ring-gray-300"," placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"),children:[(0,a.jsx)("option",{value:"",children:"Select a template"}),v.map(e=>(0,a.jsx)("option",{value:e.id,children:e.name},e.id))]}),j.templateId&&(0,a.jsx)("p",{className:"mt-2 text-sm text-red-600",children:j.templateId})]}),0===v.length&&(0,a.jsxs)("p",{className:"mt-2 text-sm text-yellow-600",children:["No templates available. ",(0,a.jsx)(i(),{href:"/templates/new",className:"text-blue-600 hover:text-blue-500",children:"Create a template"})]})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{htmlFor:"date",className:"block text-sm font-medium text-gray-700",children:"Date*"}),(0,a.jsxs)("div",{className:"mt-1 relative rounded-md shadow-sm",children:[(0,a.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,a.jsx)(m.A,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})}),(0,a.jsx)("input",{type:"date",name:"date",id:"date",value:s.date,onChange:E,className:"block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ".concat(j.date?"ring-red-300":"ring-gray-300"," placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6")})]}),j.date&&(0,a.jsx)("p",{className:"mt-2 text-sm text-red-600",children:j.date})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{htmlFor:"time",className:"block text-sm font-medium text-gray-700",children:"Time*"}),(0,a.jsxs)("div",{className:"mt-1 relative rounded-md shadow-sm",children:[(0,a.jsx)("div",{className:"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none",children:(0,a.jsx)(c.A,{className:"h-5 w-5 text-gray-400","aria-hidden":"true"})}),(0,a.jsx)("input",{type:"time",name:"time",id:"time",value:s.time,onChange:E,className:"block w-full rounded-md border-0 py-1.5 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ".concat(j.time?"ring-red-300":"ring-gray-300"," placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6")})]}),j.time&&(0,a.jsx)("p",{className:"mt-2 text-sm text-red-600",children:j.time})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{htmlFor:"duration",className:"block text-sm font-medium text-gray-700",children:"Duration"}),(0,a.jsx)("select",{id:"duration",name:"duration",value:s.duration,onChange:E,className:"mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",children:g.map(e=>(0,a.jsx)("option",{value:e.value,children:e.label},e.value))})]}),(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{htmlFor:"provider",className:"block text-sm font-medium text-gray-700",children:"Provider*"}),(0,a.jsxs)("select",{id:"provider",name:"provider",value:s.provider,onChange:E,className:"mt-1 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ".concat(j.provider?"ring-red-300":"ring-gray-300"," focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"),children:[(0,a.jsx)("option",{value:"",children:"Select a provider"}),x.map(e=>(0,a.jsx)("option",{value:e.name,children:e.name},e.id))]}),j.provider&&(0,a.jsx)("p",{className:"mt-2 text-sm text-red-600",children:j.provider})]}),(0,a.jsxs)("div",{className:"sm:col-span-2",children:[(0,a.jsx)("label",{htmlFor:"notes",className:"block text-sm font-medium text-gray-700",children:"Notes"}),(0,a.jsx)("div",{className:"mt-1",children:(0,a.jsx)("textarea",{id:"notes",name:"notes",rows:3,value:s.notes,onChange:E,className:"block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",placeholder:"Add any special notes or instructions for this visit..."})})]})]})}),(0,a.jsxs)("div",{className:"bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse",children:[(0,a.jsx)("button",{type:"submit",disabled:y,className:"w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm ".concat(y?"opacity-75 cursor-not-allowed":""),children:y?"Scheduling...":"Schedule Visit"}),(0,a.jsx)(i(),{href:"/visits",className:"mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm",children:"Cancel"})]})]})})]})}function f(){return(0,a.jsx)("div",{children:(0,a.jsx)(r.Suspense,{fallback:(0,a.jsx)("div",{children:"Loading..."}),children:(0,a.jsx)(p,{})})})}},72227:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});var a=s(12115);let r=a.forwardRef(function(e,t){let{title:s,titleId:r,...n}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),s?a.createElement("title",{id:r},s):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"}))})},77970:(e,t,s)=>{Promise.resolve().then(s.bind(s,48825))},82771:(e,t,s)=>{"use strict";s.d(t,{A:()=>r});var a=s(12115);let r=a.forwardRef(function(e,t){let{title:s,titleId:r,...n}=e;return a.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true","data-slot":"icon",ref:t,"aria-labelledby":r},n),s?a.createElement("title",{id:r},s):null,a.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"}))})},93578:(e,t,s)=>{"use strict";s.d(t,{yv:()=>a});let a=()=>{let e=localStorage.getItem("awv_templates");if(!e)return[];try{return JSON.parse(e)}catch(e){return console.error("Error parsing templates from localStorage:",e),[]}}}},e=>{var t=t=>e(e.s=t);e.O(0,[6874,8441,1684,7358],()=>t(77970)),_N_E=e.O()}]);