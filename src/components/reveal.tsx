"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, animate } from "motion/react";

export function Reveal({children,className,delay=0}:{children:React.ReactNode;className?:string;delay?:number}) {
  const reduced=useReducedMotion();
  return <motion.div className={className} initial={false} whileInView={reduced ? undefined : {y:[18,0]}} viewport={{once:true,amount:.15}} transition={{duration:.55,delay,ease:[.22,1,.36,1]}}>{children}</motion.div>;
}

export function AnimatedCounter({value,decimals=0,suffix="",className}:{value:number;decimals?:number;suffix?:string;className?:string}) {
  const ref=useRef<HTMLSpanElement>(null);
  const visible=useInView(ref,{once:true,amount:.5});
  const reduced=useReducedMotion();
  const [display,setDisplay]=useState(value.toFixed(decimals));
  useEffect(()=>{
    if(!visible || reduced) return;
    const control=animate(0,value,{duration:1.2,ease:"easeOut",onUpdate:latest=>setDisplay(latest.toFixed(decimals))});
    return ()=>control.stop();
  },[value,decimals,visible,reduced]);
  return <span ref={ref} className={className}><span aria-hidden="true">{display}{suffix}</span><span className="sr-only">{value.toFixed(decimals)}{suffix}</span></span>;
}
