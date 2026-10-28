import { Link, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArrowUpRight, BookOpen, CalendarDays, IndianRupee, Clock3, GraduationCap, MoreHorizontal, Plus, Receipt, UserPlus, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getDashboardStats } from "@/lib/supabase/data";
import { getDashboardRows, type DashboardRows } from "@/lib/supabase/dashboardCharts";
import { monthlyFees, weekActivity } from "@/lib/dashboardCharts";
import { downloadCsv } from "@/lib/export";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessWithRole } from "@/lib/navigation";
import { useToast } from "@/hooks/use-toast";
import { AppGreeting, HeroCard, ServicesGrid } from "@/components/home/AppHome";

const quickActions = [
  { label: "New admission", hint: "Add a student", to: "/student/admission-form", icon: UserPlus },
  { label: "Collect fee", hint: "Record a payment", to: "/fee/collection", icon: IndianRupee },
  { label: "Mark attendance", hint: "Today's classes", to: "/attendance/mark", icon: Users },
  { label: "Create batch", hint: "Plan a cohort", to: "/course/batch/create", icon: BookOpen },
];

type DashboardData={students:number;courses:number;feesCollected:number;outstanding:number;attendancePercentage:number;enquiriesToday:number};
const Index = () => { const {toast}=useToast();const navigate=useNavigate();const { user, view, allowedPaths } = useAuth();const branchId = user?.branchId;const canAdmit = canAccessWithRole(view, "/student/admission-form", allowedPaths);const actions = quickActions.filter((action) => canAccessWithRole(view, action.to, allowedPaths));const [metrics,setMetrics]=useState<DashboardData|null>(null);
  const load=useCallback(()=>getDashboardStats(branchId).then(r=>{if(r.success)setMetrics(r.data)}).catch(error=>toast({title:"Live dashboard unavailable",description:error.message,variant:"destructive"})),[toast,branchId]);
  useEffect(()=>{load()},[load]);
  // The rows behind the two charts, which used to be fixed numbers.
  const [rows,setRows]=useState<DashboardRows|null>(null);
  useEffect(()=>{let cancelled=false;getDashboardRows(branchId??null,user?.organizationId??null).then(r=>{if(!cancelled)setRows(r)});return()=>{cancelled=true}},[branchId,user?.organizationId]);
  const weekly=useMemo(()=>rows?weekActivity(rows.attendance,rows.payments,new Date()):[],[rows]);
  const marked=weekly.filter(d=>d.attendance!==null);
  const weekAverage=marked.length?Math.round(marked.reduce((sum,d)=>sum+(d.attendance as number),0)/marked.length*10)/10:null;
  const fees=useMemo(()=>rows?monthlyFees(rows.payments,rows.invoices,new Date()).map(r=>({m:r.m,paid:r.collected,due:r.due})):[],[rows]); const money=(value:number)=>value>=100000?`₹${(value/100000).toFixed(1)}L`:value>=1000?`₹${Math.round(value/1000)}K`:`₹${Math.round(value)}`;
  // A KPI row is a comparison, so the four cards get identical treatment — the
  // delta pill carries the state instead of one card being visually louder.
  const stats=[
    {label:"Active students",value:metrics?.students??"—",delta:`${metrics?.courses??0} courses`,tone:"delta-flat",note:"currently running",icon:GraduationCap},
    {label:"Attendance today",value:metrics?`${metrics.attendancePercentage}%`:"—",delta:`${metrics?.enquiriesToday??0} enquiries`,tone:"delta-flat",note:"logged today",icon:Users},
    {label:"Fees collected",value:metrics?money(metrics.feesCollected):"—",delta:"Live",tone:"delta-up",note:"this month",icon:Receipt},
    {label:"Outstanding",value:metrics?money(metrics.outstanding):"—",delta:"Due",tone:"delta-down",note:"across invoices",icon:Clock3},
  ];
  return (
  <AppLayout>
    <AppGreeting name={user?.name?.split(" ")[0]||"Admin"} title="What needs you today?" right={canAdmit ? <Button asChild><Link to="/student/admission-form"><Plus/>New admission</Link></Button> : null}/>
    <HeroCard
      badge="This month"
      headline={metrics?`${money(metrics.feesCollected)} collected`:"Fees collected"}
      accent={metrics?`${money(metrics.outstanding)} still due`:undefined}
      note="Across every branch · live from fee records"
      figures={[
        {value:metrics?.students??"—",label:"Students",to:"/student/view"},
        {value:metrics?`${metrics.attendancePercentage}%`:"—",label:"Attendance",to:"/attendance/report"},
        {value:metrics?.enquiriesToday??"—",label:"Enquiries today",to:"/reception/enquiry"},
      ]}
      primary={{label:"Collect fee",to:"/fee/collection"}}
      secondary={{label:"Due fees",to:"/fee/due-collection"}}
    />
    <ServicesGrid/>

    <section className="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map(stat=>
        <Card key={stat.label} className="group relative overflow-hidden transition-colors hover:border-brand/40">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="eyebrow pt-1">{stat.label}</p>
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-brand/12 group-hover:text-brand-ink"><stat.icon className="h-4 w-4"/></span>
            </div>
            <p className="metric mt-4">{stat.value}</p>
            <div className="mt-3 flex items-center gap-2">
              <span className={`delta ${stat.tone}`}>{stat.delta}</span>
              <span className="text-xs text-muted-foreground">{stat.note}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </section>

    <section className="mb-5 grid gap-5 xl:grid-cols-[1.55fr_.9fr]">
      <Card className="overflow-hidden"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Institution pulse</CardTitle><p className="mt-1 text-xs text-muted-foreground">Attendance performance · this week</p></div><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>{load();toast({title:"Dashboard refreshed",description:"Metrics were re-fetched."})}}>Refresh metrics</DropdownMenuItem><DropdownMenuItem onSelect={()=>downloadCsv("institution-pulse-week.csv",weekly)}>Export this week (CSV)</DropdownMenuItem><DropdownMenuItem onSelect={()=>navigate("/attendance/report")}>Open attendance report</DropdownMenuItem></DropdownMenuContent></DropdownMenu></CardHeader><CardContent><div className="mb-3 flex items-end gap-2.5"><span className="metric">{weekAverage===null?"—":`${weekAverage}%`}</span><span className="mb-1.5 text-xs text-muted-foreground">{weekAverage===null?"No register taken this week":"average, days with a register"}</span></div><ResponsiveContainer width="100%" height={230}><AreaChart data={weekly} margin={{top:4,right:4,left:-18,bottom:0}}><defs><linearGradient id="attendance" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--chart-2))" stopOpacity={.32}/><stop offset="100%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4"/><XAxis dataKey="day" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))"/><YAxis domain={[0,100]} axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))"/><Tooltip cursor={{stroke:"hsl(var(--border))"}} contentStyle={{borderRadius:12,border:"1px solid hsl(var(--border))",background:"hsl(var(--popover))",color:"hsl(var(--popover-foreground))",fontSize:12}}/><Area type="monotone" dataKey="attendance" stroke="hsl(var(--chart-2))" strokeWidth={2.5} fill="url(#attendance)" dot={false} activeDot={{r:5,fill:"hsl(var(--chart-2))",stroke:"hsl(var(--card))",strokeWidth:2}}/></AreaChart></ResponsiveContainer></CardContent></Card>

      <Card><CardHeader><CardTitle>Quick actions</CardTitle><p className="text-xs text-muted-foreground">Your most-used workflows, directly accessible</p></CardHeader><CardContent className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">{actions.map(action=><Link key={action.label} to={action.to} className="group flex items-center gap-3 rounded-2xl border border-border/70 p-3 transition hover:border-foreground/20 hover:bg-muted/60"><span className="grid h-10 w-10 place-items-center rounded-lg bg-muted transition-colors group-hover:bg-brand group-hover:text-brand-foreground"><action.icon className="h-4 w-4"/></span><span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{action.label}</span><span className="block text-xs text-muted-foreground">{action.hint}</span></span><ArrowUpRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></Link>)}</CardContent></Card>
    </section>

    <section className="grid gap-5 lg:grid-cols-3">
      <Card className="lg:col-span-2"><CardHeader className="flex-row items-center justify-between space-y-0"><div><CardTitle>Fee collection</CardTitle><div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-chart-1"/>Paid</span><span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-[2px] bg-chart-4"/>Outstanding</span><span>· ₹ thousand, last five months</span></div></div><Button variant="outline" size="sm" asChild><Link to="/fee/collection">View details</Link></Button></CardHeader><CardContent><ResponsiveContainer width="100%" height={220}><BarChart data={fees} barGap={5} margin={{top:4,right:4,left:-18,bottom:0}}><CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="2 4"/><XAxis dataKey="m" axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))"/><YAxis axisLine={false} tickLine={false} fontSize={11} stroke="hsl(var(--muted-foreground))"/><Tooltip cursor={{fill:"hsl(var(--muted) / .5)"}} contentStyle={{borderRadius:12,border:"1px solid hsl(var(--border))",background:"hsl(var(--popover))",color:"hsl(var(--popover-foreground))",fontSize:12}}/><Bar name="Paid" dataKey="paid" fill="hsl(var(--chart-1))" radius={[5,5,2,2]} maxBarSize={22}/><Bar name="Outstanding" dataKey="due" fill="hsl(var(--chart-4))" radius={[5,5,2,2]} maxBarSize={22}/></BarChart></ResponsiveContainer></CardContent></Card>
      <Card><CardHeader className="flex-row items-center justify-between space-y-0"><CardTitle>Coming up</CardTitle><Button variant="ghost" size="icon" title="Open exam schedule" onClick={()=>navigate("/exam/schedule")}><CalendarDays/></Button></CardHeader><CardContent className="space-y-1">{[{day:"18",mon:"AUG",title:"Mid-term examinations",time:"09:00 · All branches"},{day:"21",mon:"AUG",title:"Parent–teacher meeting",time:"11:30 · Main campus"},{day:"28",mon:"AUG",title:"Fee payment deadline",time:"End of day"}].map((event,i)=><div key={event.title} className="flex items-center gap-3 border-b py-3 last:border-0"><div className={i===0?"grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-brand/35 bg-brand/12 text-brand-ink":"grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground"}><span className="tabular text-center text-base font-bold leading-3">{event.day}<small className="mt-1 block text-[8px] font-semibold tracking-wider">{event.mon}</small></span></div><div className="min-w-0"><p className="truncate text-sm font-semibold">{event.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{event.time}</p></div></div>)}</CardContent></Card>
    </section>
  </AppLayout>
);

};
export default Index;
